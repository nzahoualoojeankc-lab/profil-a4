(function() {
  const bucketName = 'profili-a4-profile-photos';
  const maxImageSize = 5 * 1024 * 1024;
  const fontFamilies = [
    "'Times New Roman', serif",
    'Arial, sans-serif',
    "'Courier New', monospace",
    'Georgia, serif',
    'Verdana, sans-serif'
  ];
  const themePresets = {
    source: { main: '#6ba23f', background: '#5a7a8a', card: '#ffffff', accent: '#ffd700', text: '#111111' },
    corporate: { main: '#24527a', background: '#e8eef5', card: '#ffffff', accent: '#d8a52a', text: '#17212b' },
    festival: { main: '#a43d86', background: '#fff0d9', card: '#ffffff', accent: '#f1a42b', text: '#302033' }
  };
  const categoryLabels = {
    payroll_report: 'Rapport de paie',
    payroll_check: 'Chèque de paie',
    event_badge: 'Badge du personnel',
    event_ticket: 'Billet d’événement'
  };
  const categoryTitles = {
    payroll_report: 'Récapitulatif de rémunération',
    payroll_check: 'Chèque de paie — modèle imprimable',
    event_badge: 'Badge du personnel',
    event_ticket: 'Billet d’événement'
  };

  let client = null;
  let userId = null;
  let current = null;
  let currentTemplateId = null;
  let currentDocumentId = null;
  let draftId = null;
  let templates = [];
  let documents = [];
  let channel = null;
  let draftImagePaths = new Set();
  let pendingDeletePaths = new Set();
  const signedUrls = new Map();
  const signedUrlRequests = new Map();

  function t(text) {
    return window.AppI18n.t(text);
  }

  function makeField(id, label, type, extra = {}) {
    return { id, label, type, visible: true, ...extra };
  }

  function makePreset(category) {
    const definitions = {
      payroll_report: {
        templateName: 'Rapport de paie',
        documentTitle: 'Récapitulatif de rémunération',
        theme: 'source',
        shape: 'rounded',
        fields: [
          makeField('logo', 'Logo de l’organisation', 'image'),
          makeField('employer', 'Organisation', 'text'),
          makeField('person_photo', 'Photo du salarié', 'image'),
          makeField('employee', 'Nom du salarié', 'text'),
          makeField('phone', 'Téléphone', 'text'),
          makeField('period', 'Période de rémunération', 'text'),
          makeField('order_count', 'Nombre de commandes', 'number'),
          makeField('orders_sum', 'Montant des commandes', 'money'),
          makeField('bonuses', 'Primes', 'money'),
          makeField('fines', 'Pénalités (saisir une valeur négative)', 'money'),
          makeField('total', 'Montant total à payer', 'computed', { formula: 'payroll_total' })
        ],
        values: {
          logo: '',
          employer: '',
          person_photo: '',
          employee: '',
          phone: '',
          period: '',
          order_count: '',
          orders_sum: '0',
          bonuses: '0',
          fines: '0',
          currency: '₽'
        }
      },
      payroll_check: {
        templateName: 'Chèque de paie imprimable',
        documentTitle: 'Chèque de paie — modèle imprimable',
        theme: 'corporate',
        shape: 'square',
        fields: [
          makeField('employer', 'Organisation émettrice', 'text'),
          makeField('bank', 'Banque', 'text'),
          makeField('check_number', 'Numéro du chèque', 'text'),
          makeField('issue_date', 'Date d’émission', 'date'),
          makeField('payee', 'Bénéficiaire', 'text'),
          makeField('amount', 'Montant', 'money'),
          makeField('currency', 'Devise', 'text'),
          makeField('purpose', 'Motif', 'text'),
          makeField('signature', 'Signature autorisée', 'text')
        ],
        values: { employer: '', bank: '', check_number: '', issue_date: '', payee: '', amount: '', currency: '₽', purpose: '', signature: '' }
      },
      event_badge: {
        templateName: 'Badge du personnel',
        documentTitle: 'Badge du personnel événementiel',
        theme: 'festival',
        shape: 'badge',
        fields: [
          makeField('logo', 'Logo de l’organisation', 'image'),
          makeField('event', 'Événement', 'text'),
          makeField('person_photo', 'Photo du membre du personnel', 'image'),
          makeField('staff_name', 'Nom du membre du personnel', 'text'),
          makeField('role', 'Fonction', 'text'),
          makeField('organization', 'Organisation', 'text'),
          makeField('validity', 'Dates de validité', 'text'),
          makeField('badge_number', 'Numéro du badge', 'text'),
          makeField('contact', 'Contact', 'text')
        ],
        values: { logo: '', event: '', person_photo: '', staff_name: '', role: '', organization: '', validity: '', badge_number: '', contact: '' }
      },
      event_ticket: {
        templateName: 'Billet d’événement',
        documentTitle: 'Billet d’événement',
        theme: 'festival',
        shape: 'ticket',
        fields: [
          makeField('event', 'Nom de l’événement', 'text'),
          makeField('event_type', 'Type d’événement', 'text'),
          makeField('attendee', 'Nom du participant', 'text'),
          makeField('date_time', 'Date et heure', 'text'),
          makeField('venue', 'Lieu', 'text'),
          makeField('ticket_type', 'Catégorie du billet', 'text'),
          makeField('seat', 'Place', 'text'),
          makeField('ticket_number', 'Numéro du billet', 'text'),
          makeField('price', 'Prix', 'money'),
          makeField('currency', 'Devise', 'text'),
          makeField('access_notes', 'Informations complémentaires', 'text')
        ],
        values: { event: '', event_type: '', attendee: '', date_time: '', venue: '', ticket_type: '', seat: '', ticket_number: '', price: '', currency: '₽', access_notes: '' }
      }
    };
    const preset = definitions[category];
    if (!preset) throw new Error(t('Type de document non pris en charge.'));
    const theme = { ...themePresets[preset.theme], preset: preset.theme, font: fontFamilies[0] };
    return {
      category,
      templateName: t(preset.templateName),
      documentTitle: t(preset.documentTitle),
      templateNameIsDefault: true,
      documentTitleIsDefault: true,
      design: {
        version: 1,
        category,
        orientation: 'portrait',
        shape: preset.shape,
        theme,
        fields: preset.fields
      },
      values: preset.values
    };
  }

  function normalizeDesign(design, category) {
    if (!design || typeof design !== 'object' || Array.isArray(design)) return makePreset(category).design;
    const defaults = makePreset(category).design;
    const shapeValues = ['rounded', 'square', 'ticket', 'badge'];
    const fields = Array.isArray(design.fields) ? design.fields.slice(0, 40).map(field => {
      if (!field || typeof field !== 'object' || Array.isArray(field)) return null;
      const id = typeof field.id === 'string' && /^[a-z0-9_-]{1,60}$/i.test(field.id) ? field.id : '';
      const type = ['text', 'number', 'money', 'date', 'image', 'computed'].includes(field.type) ? field.type : 'text';
      const label = typeof field.label === 'string' ? field.label.trim().slice(0, 80) : '';
      if (!id || !label) return null;
      const normalized = { id, label, type, visible: field.visible !== false };
      if (type === 'computed' && field.formula === 'payroll_total') normalized.formula = 'payroll_total';
      return normalized;
    }).filter(Boolean) : defaults.fields;
    const themeInput = design.theme && typeof design.theme === 'object' ? design.theme : {};
    const baseTheme = themePresets[themeInput.preset] ? themePresets[themeInput.preset] : themePresets[defaults.theme.preset];
    const color = (value, fallback) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    return {
      version: 1,
      category,
      orientation: design.orientation === 'landscape' ? 'landscape' : 'portrait',
      shape: shapeValues.includes(design.shape) ? design.shape : defaults.shape,
      theme: {
        preset: themePresets[themeInput.preset] ? themeInput.preset : defaults.theme.preset,
        main: color(themeInput.main, baseTheme.main),
        background: color(themeInput.background, baseTheme.background),
        card: color(themeInput.card, baseTheme.card),
        accent: color(themeInput.accent, baseTheme.accent),
        text: color(themeInput.text, baseTheme.text),
        font: fontFamilies.includes(themeInput.font) ? themeInput.font : defaults.theme.font
      },
      fields: fields.length ? fields : defaults.fields
    };
  }

  function normalizeValues(values, design) {
    const source = values && typeof values === 'object' && !Array.isArray(values) ? values : {};
    const result = {};
    design.fields.forEach(field => {
      const value = source[field.id];
      if (typeof value !== 'string') {
        result[field.id] = '';
        return;
      }
      if (field.type === 'image' && !value.startsWith(`${userId}/documents/`)) {
        result[field.id] = '';
        return;
      }
      result[field.id] = value.slice(0, field.type === 'image' ? 500 : 1000);
    });
    if (typeof source.currency === 'string') result.currency = source.currency.slice(0, 12);
    return result;
  }

  function getSafeCurrent() {
    if (!current) throw new Error(t('Choisissez un type de document.'));
    current.design = normalizeDesign(current.design, current.category);
    current.values = normalizeValues(current.values, current.design);
    return current;
  }

  function setFeedback(message, isError) {
    const feedback = document.getElementById('documentFeedback');
    feedback.textContent = message || '';
    feedback.classList.toggle('error', !!isError);
  }

  function option(select, value, label) {
    const item = document.createElement('option');
    item.value = value;
    item.textContent = label;
    select.appendChild(item);
  }

  function renderSelectors() {
    const categorySelect = document.getElementById('documentCategory');
    const templateSelect = document.getElementById('documentTemplateSelect');
    const documentSelect = document.getElementById('savedDocumentSelect');
    categorySelect.value = current ? current.category : 'payroll_report';

    templateSelect.replaceChildren();
    option(templateSelect, '', t('Choisir un modèle enregistré'));
    templates.filter(item => item.category === categorySelect.value).forEach(item => {
      option(templateSelect, item.id, item.name);
    });
    templateSelect.value = currentTemplateId || '';

    documentSelect.replaceChildren();
    option(documentSelect, '', t('Choisir un document enregistré'));
    documents.forEach(item => {
      option(documentSelect, item.id, `${item.title} — ${new Date(item.updated_at).toLocaleDateString(window.AppI18n.currentLanguage())}`);
    });
    documentSelect.value = currentDocumentId || '';
  }

  function renderThemeControls() {
    if (!current) return;
    const theme = current.design.theme;
    document.getElementById('documentThemeSelect').value = theme.preset;
    document.getElementById('documentOrientation').value = current.design.orientation;
    document.getElementById('documentShape').value = current.design.shape;
    document.getElementById('documentMainColor').value = theme.main;
    document.getElementById('documentBackgroundColor').value = theme.background;
    document.getElementById('documentAccentColor').value = theme.accent;
    document.getElementById('documentTextColor').value = theme.text;
    document.getElementById('documentFont').value = theme.font;
  }

  function renderFieldEditors() {
    const definitions = document.getElementById('documentFieldDefinitions');
    const values = document.getElementById('documentFieldValues');
    definitions.replaceChildren();
    values.replaceChildren();
    if (!current) return;

    current.design.fields.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = 'document-field-definition';

      const label = document.createElement('input');
      label.type = 'text';
      label.maxLength = 80;
      label.value = field.label;
      label.setAttribute('aria-label', t('Nom du champ'));
      label.dataset.documentFieldLabel = field.id;
      label.dataset.handlerInput = 'h87';
      row.appendChild(label);

      const visibleLabel = document.createElement('label');
      visibleLabel.className = 'document-field-visible';
      const visible = document.createElement('input');
      visible.type = 'checkbox';
      visible.checked = field.visible;
      visible.dataset.documentFieldVisible = field.id;
      visible.dataset.handlerChange = 'h87';
      visibleLabel.appendChild(visible);
      visibleLabel.append(document.createTextNode(t('Afficher')));
      row.appendChild(visibleLabel);

      const moveUp = document.createElement('button');
      moveUp.type = 'button';
      moveUp.className = 'secondary';
      moveUp.textContent = '↑';
      moveUp.title = t('Monter le champ');
      moveUp.dataset.documentFieldMove = field.id;
      moveUp.dataset.documentDirection = '-1';
      moveUp.dataset.handlerClick = 'h88';
      moveUp.disabled = index === 0;
      row.appendChild(moveUp);

      const moveDown = document.createElement('button');
      moveDown.type = 'button';
      moveDown.className = 'secondary';
      moveDown.textContent = '↓';
      moveDown.title = t('Descendre le champ');
      moveDown.dataset.documentFieldMove = field.id;
      moveDown.dataset.documentDirection = '1';
      moveDown.dataset.handlerClick = 'h88';
      moveDown.disabled = index === current.design.fields.length - 1;
      row.appendChild(moveDown);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'danger';
      remove.textContent = t('Retirer');
      remove.dataset.documentFieldRemove = field.id;
      remove.dataset.handlerClick = 'h89';
      row.appendChild(remove);
      definitions.appendChild(row);

      const valueGroup = document.createElement('div');
      valueGroup.className = 'document-value-field';
      const valueLabel = document.createElement('label');
      valueLabel.textContent = t(field.label);
      const value = current.values[field.id] || '';
      if (field.type === 'computed') {
        const output = document.createElement('output');
        output.textContent = computedValue(field, current.values);
        valueGroup.append(valueLabel, output);
      } else if (field.type === 'image') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';
        input.dataset.documentFieldValue = field.id;
        input.dataset.handlerChange = 'h87';
        valueLabel.htmlFor = `document-image-${field.id}`;
        input.id = `document-image-${field.id}`;
        valueGroup.append(valueLabel, input);
        if (value) {
          const note = document.createElement('small');
          note.textContent = t('Image enregistrée dans ce document.');
          valueGroup.appendChild(note);
        }
      } else {
        const input = document.createElement('input');
        input.type = field.type === 'money' || field.type === 'number' ? 'number' : field.type;
        if (field.type === 'money') input.step = '0.01';
        if (field.type === 'number') input.step = '1';
        input.value = value;
        if (input.type === 'text') input.maxLength = 1000;
        input.dataset.documentFieldValue = field.id;
        input.dataset.handlerInput = 'h87';
        valueLabel.htmlFor = `document-value-${field.id}`;
        input.id = `document-value-${field.id}`;
        valueGroup.append(valueLabel, input);
      }
      values.appendChild(valueGroup);
    });
  }

  function render() {
    if (!current) return;
    const safeCurrent = getSafeCurrent();
    renderSelectors();
    document.getElementById('documentTemplateName').value = safeCurrent.templateName;
    document.getElementById('documentTitle').value = safeCurrent.documentTitle;
    renderThemeControls();
    renderFieldEditors();
    renderPreview();
  }

  function numberFromValue(value) {
    const parsed = Number(String(value || '').trim().replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(amount, currency) {
    const formatted = new Intl.NumberFormat(window.AppI18n.currentLanguage(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
    return `${formatted} ${currency || ''}`.trim();
  }

  function computedValue(field, values) {
    if (field.formula === 'payroll_total') {
      const total = numberFromValue(values.orders_sum)
        + numberFromValue(values.bonuses)
        + numberFromValue(values.fines);
      return formatMoney(total, values.currency);
    }
    return '';
  }

  function fieldValue(field) {
    if (field.type === 'computed') return computedValue(field, current.values);
    const value = current.values[field.id] || '';
    if (field.type === 'money' && value) return formatMoney(numberFromValue(value), current.values.currency);
    return value;
  }

  async function signedUrl(path) {
    if (signedUrls.has(path)) return signedUrls.get(path);
    if (signedUrlRequests.has(path)) return signedUrlRequests.get(path);
    const request = client.storage.from(bucketName).createSignedUrl(path, 3600).then(({ data, error }) => {
      if (error) throw error;
      signedUrls.set(path, data.signedUrl);
      signedUrlRequests.delete(path);
      return data.signedUrl;
    }).catch(error => {
      signedUrlRequests.delete(path);
      throw error;
    });
    signedUrlRequests.set(path, request);
    return request;
  }

  function renderPreview() {
    const host = document.getElementById('documentPreview');
    host.replaceChildren();
    if (!current) return;
    const sheet = document.createElement('article');
    sheet.className = 'document-sheet';
    sheet.dataset.category = current.category;
    sheet.dataset.orientation = current.design.orientation;
    sheet.dataset.shape = current.design.shape;
    const theme = current.design.theme;
    sheet.style.setProperty('--document-main', theme.main);
    sheet.style.setProperty('--document-background', theme.background);
    sheet.style.setProperty('--document-card', theme.card);
    sheet.style.setProperty('--document-accent', theme.accent);
    sheet.style.setProperty('--document-text', theme.text);
    sheet.style.setProperty('--document-font', theme.font);

    const card = document.createElement('div');
    card.className = 'document-preview-card';
    const category = document.createElement('p');
    category.className = 'document-preview-category';
    category.textContent = t(categoryLabels[current.category]);
    const heading = document.createElement('h2');
    heading.textContent = current.documentTitle;
    const fields = document.createElement('div');
    fields.className = 'document-preview-fields';

    current.design.fields.filter(field => field.visible).forEach(field => {
      const row = document.createElement('div');
      row.className = `document-preview-field${field.type === 'image' ? ' image-field' : ''}`;
      if (field.type === 'image') {
        const path = current.values[field.id];
        if (path) {
          const image = document.createElement('img');
          image.alt = t(field.label);
          row.appendChild(image);
          signedUrl(path).then(url => {
            if (image.isConnected) image.src = url;
          }).catch(error => setFeedback(error.message, true));
        } else {
          const placeholder = document.createElement('span');
          placeholder.textContent = t('Image facultative');
          row.appendChild(placeholder);
        }
        fields.appendChild(row);
        return;
      }
      const label = document.createElement('strong');
      label.textContent = t(field.label);
      const value = document.createElement('span');
      value.textContent = fieldValue(field);
      row.append(label, value);
      fields.appendChild(row);
    });

    card.append(category, heading, fields);
    if (current.category === 'payroll_check') {
      const disclaimer = document.createElement('p');
      disclaimer.className = 'document-disclaimer';
      disclaimer.textContent = t('Maquette imprimable uniquement : ce document n’est pas un chèque bancaire valide.');
      card.appendChild(disclaimer);
    } else if (current.category === 'event_ticket') {
      const disclaimer = document.createElement('p');
      disclaimer.className = 'document-disclaimer';
      disclaimer.textContent = t('Modèle de billet imprimable : l’application ne valide pas les entrées et ne traite pas les paiements.');
      card.appendChild(disclaimer);
    }
    sheet.appendChild(card);
    host.appendChild(sheet);
    updatePrintRules();
  }

  function updatePrintRules() {
    let style = document.getElementById('documentPrintRules');
    if (!style) {
      style = document.createElement('style');
      style.id = 'documentPrintRules';
      document.head.appendChild(style);
    }
    const orientation = current && current.design.orientation === 'landscape' ? 'landscape' : 'portrait';
    style.textContent = `@page { size: A4 ${orientation}; margin: 10mm; }`;
  }

  function renderCollections() {
    renderSelectors();
  }

  async function loadCollections() {
    if (!client || !userId) return;
    const requestedUserId = userId;
    const [templateResult, documentResult] = await Promise.all([
      client.from('account_document_templates')
        .select('id,category,name,design,updated_at')
        .eq('user_id', requestedUserId)
        .order('updated_at', { ascending: false })
        .limit(100),
      client.from('account_documents')
        .select('id,category,title,payload,updated_at')
        .eq('user_id', requestedUserId)
        .order('updated_at', { ascending: false })
        .limit(300)
    ]);
    if (templateResult.error) throw templateResult.error;
    if (documentResult.error) throw documentResult.error;
    if (userId !== requestedUserId) return;
    templates = templateResult.data || [];
    documents = documentResult.data || [];
    renderCollections();
  }

  function subscribe() {
    if (!client || !userId) return;
    const subscribedUserId = userId;
    channel = client.channel(`account-documents:${subscribedUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'account_document_templates',
        filter: `user_id=eq.${subscribedUserId}`
      }, () => loadCollections().catch(error => setFeedback(error.message, true)))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'account_documents',
        filter: `user_id=eq.${subscribedUserId}`
      }, () => loadCollections().catch(error => setFeedback(error.message, true)))
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setFeedback(t('La synchronisation des documents est indisponible.'), true);
        }
      });
  }

  async function initialize(supabaseClient, accountId) {
    await reset();
    client = supabaseClient;
    userId = accountId;
    current = makePreset('payroll_report');
    currentTemplateId = null;
    currentDocumentId = null;
    draftId = crypto.randomUUID();
    render();
    try {
      await loadCollections();
      setFeedback('', false);
    } catch (error) {
      setFeedback(error.message, true);
    }
    subscribe();
  }

  async function cleanupPaths(paths) {
    const uniquePaths = [...new Set(paths.filter(Boolean))];
    if (!client || !uniquePaths.length) return null;
    const { error } = await client.storage.from(bucketName).remove(uniquePaths);
    if (error) return error;
    uniquePaths.forEach(path => signedUrls.delete(path));
    return null;
  }

  async function reset() {
    if (channel && client) await client.removeChannel(channel);
    const cleanupError = await cleanupPaths([...draftImagePaths]);
    if (cleanupError) console.error('Could not clean up unsaved document images.', cleanupError);
    client = null;
    userId = null;
    current = null;
    currentTemplateId = null;
    currentDocumentId = null;
    draftId = null;
    templates = [];
    documents = [];
    channel = null;
    draftImagePaths = new Set();
    pendingDeletePaths = new Set();
    signedUrls.clear();
    signedUrlRequests.clear();
    const workspace = document.getElementById('documentsWorkspace');
    if (workspace) workspace.hidden = true;
    const profileWorkspace = document.getElementById('profileWorkspace');
    if (profileWorkspace) profileWorkspace.hidden = false;
    const profileTab = document.getElementById('profileWorkspaceTab');
    const documentsTab = document.getElementById('documentsWorkspaceTab');
    if (profileTab) {
      profileTab.classList.add('active');
      profileTab.setAttribute('aria-selected', 'true');
    }
    if (documentsTab) {
      documentsTab.classList.remove('active');
      documentsTab.setAttribute('aria-selected', 'false');
    }
    const preview = document.getElementById('documentPreview');
    if (preview) preview.replaceChildren();
    const feedback = document.getElementById('documentFeedback');
    if (feedback) setFeedback('', false);
  }

  function createPreset(category) {
    if (!categoryLabels[category]) {
      setFeedback(t('Type de document non pris en charge.'), true);
      return;
    }
    if (draftImagePaths.size) cleanupPaths([...draftImagePaths]).catch(error => setFeedback(error.message, true));
    draftImagePaths = new Set();
    pendingDeletePaths = new Set();
    current = makePreset(category);
    currentTemplateId = null;
    currentDocumentId = null;
    draftId = crypto.randomUUID();
    setFeedback('', false);
    render();
  }

  function createValuesForDesign(design) {
    const values = {};
    design.fields.forEach(field => { values[field.id] = ''; });
    if (design.category === 'payroll_report') {
      values.orders_sum = '0';
      values.bonuses = '0';
      values.fines = '0';
      values.currency = '₽';
    }
    if (design.category === 'payroll_check' || design.category === 'event_ticket') values.currency = '₽';
    return values;
  }

  function loadTemplate(id) {
    if (!id) {
      createPreset(document.getElementById('documentCategory').value);
      return;
    }
    const template = templates.find(item => item.id === id);
    if (!template) {
      setFeedback(t('Le modèle sélectionné est introuvable.'), true);
      return;
    }
    if (draftImagePaths.size) cleanupPaths([...draftImagePaths]).catch(error => setFeedback(error.message, true));
    draftImagePaths = new Set();
    pendingDeletePaths = new Set();
    const design = normalizeDesign(template.design, template.category);
    current = {
      category: template.category,
      templateName: template.name,
      documentTitle: t(categoryTitles[template.category]),
      templateNameIsDefault: false,
      documentTitleIsDefault: true,
      design,
      values: createValuesForDesign(design)
    };
    currentTemplateId = template.id;
    currentDocumentId = null;
    draftId = crypto.randomUUID();
    setFeedback('', false);
    render();
  }

  function pathsInValues(values) {
    return Object.values(values || {}).filter(value =>
      typeof value === 'string' && value.startsWith(`${userId}/documents/`)
    );
  }

  function loadDocument(id) {
    const item = documents.find(entry => entry.id === id);
    if (!item) {
      setFeedback(t('Le document sélectionné est introuvable.'), true);
      return;
    }
    if (draftImagePaths.size) cleanupPaths([...draftImagePaths]).catch(error => setFeedback(error.message, true));
    draftImagePaths = new Set();
    pendingDeletePaths = new Set();
    const payload = item.payload || {};
    const design = normalizeDesign(payload.design, item.category);
    current = {
      category: item.category,
      templateName: typeof payload.templateName === 'string' ? payload.templateName.slice(0, 120) : t(categoryLabels[item.category]),
      documentTitle: item.title,
      templateNameIsDefault: payload.templateNameIsDefault === true,
      documentTitleIsDefault: payload.documentTitleIsDefault === true,
      design,
      values: normalizeValues(payload.values, design),
      templateId: typeof payload.templateId === 'string'
        && templates.some(template => template.id === payload.templateId)
        ? payload.templateId
        : null
    };
    currentTemplateId = current.templateId;
    currentDocumentId = item.id;
    draftId = item.id;
    setFeedback('', false);
    render();
  }

  async function uploadImage(fieldId, file) {
    if (!file) return;
    if (!client || !userId || !current) {
      setFeedback(t('Connectez-vous pour enregistrer des documents dans votre compte.'), true);
      return;
    }
    const mimeExtensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    const extension = mimeExtensions[file.type];
    if (!extension) {
      setFeedback(t('Image invalide : utilisez JPEG, PNG ou WebP.'), true);
      return;
    }
    if (file.size > maxImageSize) {
      setFeedback(t('L’image dépasse la limite de 5 Mo.'), true);
      return;
    }

    const previousPath = current.values[fieldId];
    const path = `${userId}/documents/${draftId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from(bucketName).upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });
    if (error) {
      setFeedback(error.message, true);
      return;
    }
    if (previousPath) pendingDeletePaths.add(previousPath);
    draftImagePaths.add(path);
    current.values[fieldId] = path;
    signedUrls.delete(path);
    setFeedback('', false);
    renderFieldEditors();
    renderPreview();
  }

  function updateFromElement(element) {
    if (!current || !element) return;
    if (element.id === 'documentTemplateName') {
      current.templateName = element.value.slice(0, 120);
      current.templateNameIsDefault = false;
      return;
    }
    if (element.id === 'documentTitle') {
      current.documentTitle = element.value.slice(0, 160);
      current.documentTitleIsDefault = false;
      renderPreview();
      return;
    }
    if (element.dataset.documentFieldLabel) {
      const field = current.design.fields.find(item => item.id === element.dataset.documentFieldLabel);
      if (field) {
        field.label = element.value.trim().slice(0, 80);
        renderPreview();
      }
      return;
    }
    if (element.dataset.documentFieldVisible) {
      const field = current.design.fields.find(item => item.id === element.dataset.documentFieldVisible);
      if (field) {
        field.visible = element.checked;
        renderPreview();
      }
      return;
    }
    if (element.dataset.documentFieldValue) {
      const field = current.design.fields.find(item => item.id === element.dataset.documentFieldValue);
      if (!field) return;
      if (field.type === 'image') {
        uploadImage(field.id, element.files && element.files[0]).catch(error => setFeedback(error.message, true));
        return;
      }
      current.values[field.id] = element.value.slice(0, 1000);
      if (field.id === 'currency' || ['orders_sum', 'bonuses', 'fines'].includes(field.id)) {
        renderFieldEditors();
      }
      renderPreview();
      return;
    }
    if (element.dataset.documentTheme) {
      const themeName = element.value;
      if (!themePresets[themeName]) return;
      current.design.theme = {
        ...current.design.theme,
        ...themePresets[themeName],
        preset: themeName
      };
      renderThemeControls();
      renderPreview();
      return;
    }
    if (element.dataset.documentDesign) {
      const property = element.dataset.documentDesign;
      if (property === 'orientation') current.design.orientation = element.value === 'landscape' ? 'landscape' : 'portrait';
      else if (property === 'shape' && ['rounded', 'square', 'ticket', 'badge'].includes(element.value)) current.design.shape = element.value;
      else if (property === 'font' && fontFamilies.includes(element.value)) current.design.theme.font = element.value;
      else if (['main', 'background', 'accent', 'text'].includes(property) && /^#[0-9a-f]{6}$/i.test(element.value)) {
        current.design.theme[property] = element.value;
      }
      renderPreview();
    }
  }

  function addField() {
    if (!current) return;
    const input = document.getElementById('documentNewFieldLabel');
    const label = input.value.trim().slice(0, 80);
    if (!label) {
      setFeedback(t('Saisissez le nom du nouveau champ.'), true);
      input.focus();
      return;
    }
    if (current.design.fields.length >= 40) {
      setFeedback(t('Un modèle ne peut pas contenir plus de 40 champs.'), true);
      return;
    }
    const type = document.getElementById('documentNewFieldType').value;
    if (!['text', 'number', 'date'].includes(type)) {
      setFeedback(t('Type de champ non pris en charge.'), true);
      return;
    }
    const field = makeField(`custom_${crypto.randomUUID().replace(/-/g, '')}`, label, type);
    current.design.fields.push(field);
    current.values[field.id] = '';
    input.value = '';
    document.getElementById('documentNewFieldType').value = 'text';
    render();
  }

  function moveField(id, direction) {
    if (!current) return;
    const index = current.design.fields.findIndex(field => field.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.design.fields.length) return;
    [current.design.fields[index], current.design.fields[target]] =
      [current.design.fields[target], current.design.fields[index]];
    render();
  }

  function removeField(id) {
    if (!current) return;
    const field = current.design.fields.find(item => item.id === id);
    if (!field) return;
    if (field.type === 'image' && current.values[field.id]) {
      pendingDeletePaths.add(current.values[field.id]);
      delete current.values[field.id];
    }
    current.design.fields = current.design.fields.filter(item => item.id !== id);
    render();
  }

  function validateBeforeSave() {
    const title = document.getElementById('documentTitle').value.trim().slice(0, 160);
    const templateName = document.getElementById('documentTemplateName').value.trim().slice(0, 120);
    if (!title) throw new Error(t('Le titre du document est obligatoire.'));
    current.documentTitle = title;
    if (templateName) {
      current.templateName = templateName;
    } else {
      current.templateName = t(categoryLabels[current.category]);
      current.templateNameIsDefault = true;
    }
    current.design = normalizeDesign(current.design, current.category);
    current.values = normalizeValues(current.values, current.design);
    return { title, templateName: current.templateName };
  }

  async function saveTemplate() {
    if (!client || !userId) {
      setFeedback(t('Connectez-vous pour enregistrer des documents dans votre compte.'), true);
      return;
    }
    try {
      const { templateName } = validateBeforeSave();
      const row = {
        user_id: userId,
        category: current.category,
        name: templateName,
        design: current.design
      };
      let result;
      if (currentTemplateId) {
        result = await client.from('account_document_templates').update(row)
          .eq('id', currentTemplateId).eq('user_id', userId)
          .select('id,category,name,design,updated_at').single();
      } else {
        result = await client.from('account_document_templates').insert(row)
          .select('id,category,name,design,updated_at').single();
      }
      if (result.error) throw result.error;
      currentTemplateId = result.data.id;
      current.templateId = currentTemplateId;
      await loadCollections();
      setFeedback(t('Modèle enregistré dans ce compte.'), false);
    } catch (error) {
      setFeedback(error.message, true);
    }
  }

  async function saveDocument() {
    if (!client || !userId) {
      setFeedback(t('Connectez-vous pour enregistrer des documents dans votre compte.'), true);
      return;
    }
    try {
      const { title } = validateBeforeSave();
      const id = currentDocumentId || draftId;
      const payload = {
        version: 1,
        templateId: currentTemplateId,
        templateName: current.templateName,
        templateNameIsDefault: current.templateNameIsDefault,
        documentTitleIsDefault: current.documentTitleIsDefault,
        design: current.design,
        values: current.values
      };
      if (JSON.stringify(payload).length > 95000) {
        throw new Error(t('Le document est trop volumineux pour être enregistré.'));
      }
      const row = { id, user_id: userId, category: current.category, title, payload };
      const result = currentDocumentId
        ? await client.from('account_documents').update(row)
          .eq('id', currentDocumentId).eq('user_id', userId)
          .select('id,category,title,payload,updated_at').single()
        : await client.from('account_documents').insert(row)
          .select('id,category,title,payload,updated_at').single();
      if (result.error) throw result.error;
      currentDocumentId = result.data.id;
      draftId = currentDocumentId;
      const cleanupError = await cleanupPaths([...pendingDeletePaths]);
      pendingDeletePaths = new Set();
      draftImagePaths = new Set();
      await loadCollections();
      setFeedback(cleanupError
        ? `${t('Document enregistré, mais certaines anciennes images n’ont pas pu être supprimées : ')}${cleanupError.message}`
        : t('Document enregistré dans ce compte.'), !!cleanupError);
    } catch (error) {
      setFeedback(error.message, true);
    }
  }

  async function deleteDocument() {
    if (!client || !currentDocumentId) {
      setFeedback(t('Enregistrez le document avant de le supprimer.'), true);
      return;
    }
    if (!window.confirm(t('Supprimer définitivement ce document enregistré ?'))) return;
    const item = documents.find(entry => entry.id === currentDocumentId);
    const paths = pathsInValues(item && item.payload && item.payload.values);
    const { error } = await client.from('account_documents').delete()
      .eq('id', currentDocumentId).eq('user_id', userId);
    if (error) {
      setFeedback(error.message, true);
      return;
    }
    const cleanupError = await cleanupPaths(paths);
    createPreset(document.getElementById('documentCategory').value);
    await loadCollections();
    setFeedback(cleanupError
      ? `${t('Document supprimé, mais certaines images n’ont pas pu être supprimées : ')}${cleanupError.message}`
      : t('Document supprimé.'), !!cleanupError);
  }

  async function deleteTemplate() {
    if (!client || !currentTemplateId) {
      setFeedback(t('Aucun modèle enregistré n’est sélectionné.'), true);
      return;
    }
    if (!window.confirm(t('Supprimer définitivement ce modèle enregistré ?'))) return;
    const { error } = await client.from('account_document_templates').delete()
      .eq('id', currentTemplateId).eq('user_id', userId);
    if (error) {
      setFeedback(error.message, true);
      return;
    }
    const category = current.category;
    currentTemplateId = null;
    current.templateId = null;
    await loadCollections();
    setFeedback(t('Modèle supprimé.'), false);
    document.getElementById('documentTemplateSelect').value = '';
    if (category !== current.category) createPreset(category);
  }

  function activate() {
    document.getElementById('profileWorkspace').hidden = true;
    document.getElementById('documentsWorkspace').hidden = false;
    document.getElementById('profileWorkspaceTab').classList.remove('active');
    document.getElementById('documentsWorkspaceTab').classList.add('active');
    document.getElementById('profileWorkspaceTab').setAttribute('aria-selected', 'false');
    document.getElementById('documentsWorkspaceTab').setAttribute('aria-selected', 'true');
    if (current) renderPreview();
  }

  function showProfiles() {
    document.getElementById('profileWorkspace').hidden = false;
    document.getElementById('documentsWorkspace').hidden = true;
    document.getElementById('profileWorkspaceTab').classList.add('active');
    document.getElementById('documentsWorkspaceTab').classList.remove('active');
    document.getElementById('profileWorkspaceTab').setAttribute('aria-selected', 'true');
    document.getElementById('documentsWorkspaceTab').setAttribute('aria-selected', 'false');
  }

  function print() {
    if (!current) return;
    updatePrintRules();
    document.body.classList.add('printing-document');
    const restore = () => document.body.classList.remove('printing-document');
    window.addEventListener('afterprint', restore, { once: true });
    window.print();
    setTimeout(restore, 2000);
  }

  async function refresh() {
    if (!client || !userId) {
      setFeedback(t('Connectez-vous pour accéder aux documents de votre compte.'), true);
      return;
    }
    try {
      await loadCollections();
      setFeedback('', false);
    } catch (error) {
      setFeedback(error.message, true);
    }
  }

  function setLanguage() {
    if (!current) return;
    if (current.templateNameIsDefault) current.templateName = t(categoryLabels[current.category]);
    if (current.documentTitleIsDefault) current.documentTitle = t(categoryTitles[current.category]);
    render();
  }

  window.AppDocuments = {
    initialize,
    reset,
    activate,
    showProfiles,
    createPreset,
    loadTemplate,
    loadDocument,
    saveTemplate,
    saveDocument,
    deleteDocument,
    deleteTemplate,
    addField,
    moveField,
    removeField,
    updateFromElement,
    print,
    refresh,
    setLanguage
  };
})();
