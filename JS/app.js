    const appHeader = document.querySelector('.top-header');
    const loginScreen = document.getElementById('loginScreen');
    function positionLoginScreenBelowHeader() {
      if (!appHeader || !loginScreen) return;
      loginScreen.style.top = `${appHeader.getBoundingClientRect().height}px`;
    }

    positionLoginScreenBelowHeader();
    if (appHeader) {
      if (window.ResizeObserver) {
        new ResizeObserver(positionLoginScreenBelowHeader).observe(appHeader);
      }
      window.addEventListener('resize', positionLoginScreenBelowHeader);
    }

    let currentLanguage = window.AppI18n.currentLanguage();
    const signupTermsSource = document.getElementById('signupTermsContent').textContent.trim();

    function renderSignupTerms() {
      document.getElementById('signupTermsTitle').textContent =
        window.AppI18n.t('Conditions générales d’utilisation v1.0');
      document.getElementById('signupTermsContent').textContent =
        window.AppI18n.t(signupTermsSource);
    }

    renderSignupTerms();

    function changeLanguage(lang, options) {
      restoringAccountLanguage = !!(options && options.persistAccount === false);
      currentLanguage = window.AppI18n.setLanguage(lang);
      restoringAccountLanguage = false;
    }

    function showAdminTab(tabName) {
      document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('show');
      });

      document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      const tab = document.getElementById(tabName + '-tab');
      if (!tab) return;
      tab.classList.add('show');
      const activeButton = document.querySelector(`.admin-tab-btn[data-tab="${tabName}"]`);
      if (activeButton) activeButton.classList.add('active');
    }

    function toggleShortcuts() {
      if (!isA4UIReady()) return;
      document.getElementById('shortcutsOverlay').classList.toggle('show');
    }

    window.addEventListener('keydown', (e) => {
      if (!isA4UIReady()) return;
      if (e.key === '?') {
        toggleShortcuts();
      }
    });

    const CONFIG = {
      MAX_PROFILES: 300,
      MAX_STORAGE_MB: 50,
      SAVE_DEBOUNCE_MS: 1000,
      MAX_IMAGE_SIZE: 20 * 1024 * 1024,
      MAX_LOCAL_DEFAULT_IMAGE_SIZE: 512 * 1024
    };

    const COUNTRIES = {
      "🌍 АФРИКА": {
        "Ангола": "AO", "Бенин": "BJ", "Ботсвана": "BW", "Буркина-Фасо": "BF",
        "Бурунди": "BI", "Камерун": "CM", "Кабо-Верде": "CV", "Коморские острова": "KM", "Конго": "CG",
        "ДРК": "CD", "Кот-д'Ивуар": "CI", "Джибути": "DJ", "Египет": "EG", "Экваториальная Гвинея": "GQ",
        "Эритрея": "ER", "Эсватини": "SZ", "Эфиопия": "ET", "Габон": "GA", "Гамбия": "GM",
        "Гана": "GH", "Гвинея": "GN", "Гвинея-Бисау": "GW", "Кения": "KE", "Лесото": "LS",
        "Либерия": "LR", "Ливия": "LY", "Мадагаскар": "MG", "Малави": "MW", "Мали": "ML",
        "Марокко": "MA", "Мавритания": "MR", "Маврикий": "MU", "Мозамбик": "MZ", "Намибия": "NA",
        "Нигер": "NE", "Нигерия": "NG", "Руанда": "RW", "Сан-Томе и Принсипи": "ST", "Сенегал": "SN",
        "Сейшельские острова": "SC", "Сьерра-Леоне": "SL", "Сомалия": "SO", "Судан": "SD", "Южный Судан": "SS",
        "ЮАР": "ZA", "Танзания": "TZ", "Того": "TG", "Тунис": "TN", "Уганда": "UG", "Замбия": "ZM", "Зимбабве": "ZW"
      },
      "🌏 АЗИЯ": {
        "Афганистан": "AF", "Бахрейн": "BH", "Бангладеш": "BD", "Бруней": "BN", "Бутан": "BT",
        "Восточный Тимор": "TL", "Гонконг": "HK", "Индия": "IN", "Индонезия": "ID", "Иордания": "JO",
        "Ирак": "IQ", "Иран": "IR", "Израиль": "IL", "Йемен": "YE", "Казахстан": "KZ", "Камбоджа": "KH",
        "Катар": "QA", "Киргизия": "KG", "Кипр": "CY", "Китай": "CN", "Северная Корея": "KP", "Кувейт": "KW",
        "Лаос": "LA", "Ливан": "LB", "Макао": "MO", "Малайзия": "MY", "Мальдивы": "MV", "Монголия": "MN",
        "Мьянма": "MM", "Непал": "NP", "Оман": "OM", "Пакистан": "PK", "Палау": "PW", "Панама": "PA",
        "Папуа - Новая Гвинея": "PG", "Южная Корея": "KR", "Сингапур": "SG", "Сирия": "SY",
        "Таджикистан": "TJ", "Таиланд": "TH", "Тайвань": "TW", "Туркменистан": "TM", "Турция": "TR",
        "Узбекистан": "UZ", "Филиппины": "PH", "Франция": "FR", "Хорватия": "HR"
      },
      "🌎 ЕВРОПА": {
        "Австрия": "AT", "Албания": "AL", "Андорра": "AD", "Ватикан": "VA",
        "Великобритания": "GB", "Венгрия": "HU", "Гибралтар": "GI", "Гренада": "GD", "Гренландия": "GL",
        "Греция": "GR", "Дания": "DK", "Ирландия": "IE", "Исландия": "IS", "Испания": "ES", "Италия": "IT",
        "Кипр": "CY", "Косово": "XK", "Латвия": "LV", "Литва": "LT",
        "Лихтенштейн": "LI", "Люксембург": "LU", "Мальта": "MT", "Молдавия": "MD",
        "Монако": "MC", "Черногория": "ME", "Нидерланды": "NL", "Норвегия": "NO",
        "Польша": "PL", "Португалия": "PT", "Россия": "RU", "Румыния": "RO", "Сан-Марино": "SM",
        "Сербия": "RS", "Словакия": "SK", "Словения": "SI",
        "Украина": "UA", "Франция": "FR", "Фарерские острова": "FO", "Финляндия": "FI",
        "Хорватия": "HR", "Чехия": "CZ",
        "Швейцария": "CH", "Швеция": "SE", "Эстония": "EE"
      },
      "🌎 АМЕРИКА": {
        "Аргентина": "AR", "Багамские острова": "BS", "Барбадос": "BB", "Белиз": "BZ", "Боливия": "BO",
        "Бразилия": "BR", "Ванауту": "VU",
        "Великобритания": "GB", "Венесуэла": "VE", "Гаити": "HT", "Гайана": "GY",
        "Гватемала": "GT", "Гондурас": "HN", "Гренада": "GD", "Гренландия": "GL",
        "Доминика": "DM", "Доминиканская Республика": "DO", "Канада": "CA",
        "Коста-Рика": "CR", "Куба": "CU", "Мексика": "MX", "Никарагуа": "NI",
        "Панама": "PA", "Парагвай": "PY", "Перу": "PE", "Сальвадор": "SV",
        "Сент-Винсент и Гренадины": "VC", "Сент-Китс и Невис": "KN", "Сент-Люсия": "LC",
        "Суринам": "SR", "США": "US", "Тринидад и Тобаго": "TT", "Уругвай": "UY", "Ямайка": "JM",
        "Чили": "CL", "Эквадор": "EC"
      }
    };

    function localizedCountryName(country) {
      for (const region of Object.values(COUNTRIES)) {
        const code = region[country];
        if (!code) continue;
        try {
          return new Intl.DisplayNames([currentLanguage], { type: 'region' }).of(code) || country;
        } catch (error) {
          return country;
        }
      }
      return country;
    }

    function updateCountryOptionLabels() {
      const select = document.getElementById('countrySelect');
      if (!select) return;
      Array.from(select.options).forEach(option => {
        if (!option.value) return;
        option.textContent = localizedCountryName(option.value);
      });
      Array.from(select.querySelectorAll('optgroup')).forEach(group => {
        if (group.dataset.sourceLabel) group.label = window.AppI18n.t(group.dataset.sourceLabel);
      });
    }

    function updateA4LanguageLabels() {
      const genderElement = document.getElementById('personGender');
      if (genderElement && genderElement.dataset.userEdited !== 'true') {
        const labels = { male: 'Мужчина', female: 'Женщина', other: 'Не указано' };
        genderElement.textContent = window.AppI18n.t(labels[genderElement.dataset.genderValue] || 'Не указано');
      }

      const countryElement = document.getElementById('personCountry');
      if (countryElement && countryElement.dataset.userEdited !== 'true') {
        const country = countryElement.dataset.countryValue || '';
        countryElement.textContent = country
          ? localizedCountryName(country)
          : window.AppI18n.t('Страна');
      }
    }

    let a4ResizeObserver = null;
    function fitA4ToViewport() {
      const area = document.getElementById('documentArea');
      const wrapper = area && area.querySelector('.a4-wrapper');
      const page = wrapper && wrapper.querySelector('.a4');
      if (!area || !wrapper || !page) return;

      const areaStyle = window.getComputedStyle(area);
      const horizontalPadding = parseFloat(areaStyle.paddingLeft) + parseFloat(areaStyle.paddingRight);
      const availableWidth = area.clientWidth - horizontalPadding;
      const pageWidth = page.offsetWidth;
      if (availableWidth <= 0 || pageWidth <= 0) return;

      const scale = Math.min(1, availableWidth / pageWidth);
      page.style.transform = `scale(${scale})`;
      wrapper.style.width = `${Math.ceil(pageWidth * scale)}px`;
      wrapper.style.height = `${Math.ceil(page.offsetHeight * scale)}px`;
    }

    function observeA4Layout() {
      if (a4ResizeObserver) a4ResizeObserver.disconnect();
      const area = document.getElementById('documentArea');
      const page = document.getElementById('page');
      if (window.ResizeObserver && area && page) {
        a4ResizeObserver = new ResizeObserver(fitA4ToViewport);
        a4ResizeObserver.observe(area);
        a4ResizeObserver.observe(page);
      }
      requestAnimationFrame(fitA4ToViewport);
    }

    function persistAccountLanguage(language) {
      if (!authState.currentUser || !supabaseClient) return;
      try {
        setUserSetting('language', language);
      } catch (error) {
        setSyncStatus('Не удалось сохранить язык на этом устройстве: ' + error.message, true);
      }
      supabaseClient.auth.updateUser({
        data: { application_language: language }
      }).then(({ error }) => {
        if (error) {
          setSyncStatus('Не удалось сохранить язык аккаунта: ' + error.message, true);
          console.error('Could not save account language preference.', error);
        }
      }).catch(error => {
        setSyncStatus('Не удалось сохранить язык аккаунта: ' + error.message, true);
        console.error('Could not save account language preference.', error);
      });
    }

    let restoringAccountLanguage = false;
    window.addEventListener('app-language-changed', event => {
      const previousLanguage = currentLanguage;
      currentLanguage = event.detail.language;
      updateA4LanguageLabels();
      updateCountryOptionLabels();
      if (window.AppNotifications) window.AppNotifications.setLanguage();
      if (window.AppDocuments) window.AppDocuments.setLanguage();
      if (previousLanguage !== currentLanguage && !restoringAccountLanguage) {
        persistAccountLanguage(currentLanguage);
      }
      renderSignupTerms();
      if (accountAccess) renderAccountAccess();
    });

    let authState = { currentUser: null, isLoggedIn: false };
    let appState = {
      allProfiles: [],
      archivedProfiles: [],
      currentProfileId: null,
      showArchivedProfiles: false,
      saveTimeout: null,
      profileToDelete: null,
      colorMode: 'global',
      suppressProfileRealtime: false,
      fontFamily: 'Times New Roman',
      fontSettings: { fontFamily: 'Times New Roman', fontSize: 16, textColor: '#333333' },
      colors: {
        textColor: '#333333',
        greenColor: '#159b63',
        redColor: '#d72626',
        cardBgColor: '#ffffff',
        photoBorderColor: '#b40000',
        totalBoxBgColor: '#eef4fb'
      },
      defaultPhotos: { male: null, female: null, other: null },
      profileColors: {},
      sizes: {
        name: 29,
        phone: 23,
        date: 29,
        row: 24,
        totalPrice: 31,
        totalLabel: 27
      },
      batchSelectedProfiles: new Set()
    };

    let db = null;
    let supabaseClient = null;
    let realtimeChannel = null;
    let activeUserId = null;
    let passwordRecoveryInProgress = false;
    let signupAcceptanceInProgress = false;
    let accountAccess = null;
    let accountStatusTimer = null;
    let accountAccessRequest = null;
    let accountAccessRequestUserId = null;
    let adminAccounts = [];
    let selectedAdminAccount = null;

    async function accountModerationRequest(body) {
      const { data, error } = await getSupabaseClient().functions.invoke('account-moderation', { body });
      if (error) {
        let message = error.message || 'Не удалось проверить доступ к аккаунту.';
        if (error.context && typeof error.context.clone === 'function') {
          const responseBody = await error.context.clone().json().catch(() => null);
          if (responseBody && responseBody.error) message = responseBody.error;
        }
        throw new Error(message);
      }
      if (data && data.error) throw new Error(data.error);
      return data;
    }

    async function paymentNotificationRequest(body) {
      const { data, error } = await getSupabaseClient().functions.invoke('payment-notifications', { body });
      if (error) {
        let message = error.message || 'Impossible de charger les paiements.';
        if (error.context && typeof error.context.clone === 'function') {
          const responseBody = await error.context.clone().json().catch(() => null);
          if (responseBody && responseBody.error) message = responseBody.error;
        }
        throw new Error(message);
      }
      if (data && data.error) throw new Error(data.error);
      return data;
    }

    async function loadAccountAccessStatus() {
      const userId = authState.currentUser && authState.currentUser.id;
      if (!userId) throw new Error('Connectez-vous pour vérifier le statut du compte.');
      if (accountAccessRequest && accountAccessRequestUserId === userId) return accountAccessRequest;

      const request = accountModerationRequest({ action: 'status' }).then(status => {
        if (!authState.currentUser || authState.currentUser.id !== userId) {
          throw new Error('La session a changé pendant la vérification.');
        }
        accountAccess = status;
        renderAccountAccess();
        return status;
      });
      accountAccessRequest = request;
      accountAccessRequestUserId = userId;
      try {
        return await request;
      } finally {
        if (accountAccessRequest === request) {
          accountAccessRequest = null;
          accountAccessRequestUserId = null;
        }
      }
    }

    function renderAccountAccess() {
      if (!accountAccess) return;
      const gate = document.getElementById('accountAccessGate');
      const termsPanel = document.getElementById('accountTermsPanel');
      const suspensionPanel = document.getElementById('accountSuspensionPanel');
      const errorPanel = document.getElementById('accountStatusErrorPanel');
      const isSuspended = accountAccess.status === 'suspended';
      const needsTerms = !accountAccess.termsAccepted;
      const blocked = isSuspended || needsTerms;
      document.body.classList.toggle('account-ui-ready', authState.isLoggedIn && !blocked);
      document.getElementById('accountNotificationsButton').hidden = blocked;
      if (blocked) {
        document.getElementById('accountNotificationPanel').hidden = true;
        document.getElementById('accountNotificationsButton').setAttribute('aria-expanded', 'false');
      }

      if (blocked) {
        document.getElementById('acceptAccountTerms').checked = false;
        document.getElementById('acceptAccountTermsButton').disabled = true;
      }
      termsPanel.hidden = isSuspended || !needsTerms;
      suspensionPanel.hidden = !isSuspended;
      errorPanel.hidden = true;
      gate.classList.toggle('hidden', !blocked);
      document.querySelector('.app-container').classList.toggle('hidden', blocked);

      document.getElementById('accountTermsVersion').textContent =
        window.AppI18n.t('Version des conditions : ') + accountAccess.terms.version;
      document.getElementById('accountTermsContent').textContent =
        accountAccess.terms.translations[currentLanguage];
      document.getElementById('accountSuspensionReason').textContent =
        accountAccess.suspensionReason || window.AppI18n.t('Aucun motif communiqué.');
      document.getElementById('accountAppealLink').href =
        'mailto:nzahoualoojeankc@gmail.com?subject=' +
        encodeURIComponent(window.AppI18n.t('Recours concernant la suspension du compte'));

      const notice = accountAccess.notices && accountAccess.notices[0];
      const banner = document.getElementById('accountNoticeBanner');
      if (notice && !blocked) {
        const titles = {
          suspended: 'Notification de suspension',
          reactivated: 'Notification de réactivation',
          moderator_granted: 'Délégation d’administration accordée',
          moderator_revoked: 'Délégation d’administration révoquée'
        };
        document.getElementById('accountNoticeTitle').textContent =
          window.AppI18n.t(titles[notice.action] || 'Notification du compte');
        document.getElementById('accountNoticeText').textContent =
          `${notice.reason} (${new Date(notice.created_at).toLocaleString(currentLanguage)})`;
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }

      const moderationSection = document.getElementById('accountModerationSection');
      moderationSection.hidden = !accountAccess.role;
      document.getElementById('adminTabButton').hidden = !accountAccess.role;
      document.getElementById('accountBillingSection').hidden = !accountAccess.role;
      document.getElementById('accountDelegationSection').hidden = accountAccess.role !== 'owner';
    }

    async function stopProfileAccess() {
      if (window.AppNotifications) await window.AppNotifications.reset();
      if (window.AppDocuments) await window.AppDocuments.reset();
      if (accountStatusTimer) {
        clearInterval(accountStatusTimer);
        accountStatusTimer = null;
      }
      if (realtimeChannel && supabaseClient) {
        await supabaseClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      if (appState.saveTimeout) clearTimeout(appState.saveTimeout);
      activeUserId = null;
      db = null;
      appState.allProfiles = [];
      appState.archivedProfiles = [];
      appState.currentProfileId = null;
      appState.showArchivedProfiles = false;
      appState.batchSelectedProfiles.clear();
      appState.saveTimeout = null;
      setA4UIReady(false);
      document.getElementById('adminSettingsPanel').classList.remove('show');
      document.getElementById('adminSettingsPanel').hidden = true;
      document.getElementById('adminSettingsBackdrop').hidden = true;
      document.body.classList.remove('admin-settings-open');
      document.body.classList.remove('account-ui-ready');
      document.getElementById('shortcutsOverlay').classList.remove('show');
      document.getElementById('documentArea').innerHTML = '';
      document.getElementById('profilesList').innerHTML = '';
      document.getElementById('accountNoticeBanner').hidden = true;
      document.getElementById('adminTabButton').hidden = true;
    }

    function showAccountStatusFailure(error) {
      const gate = document.getElementById('accountAccessGate');
      document.getElementById('accountTermsPanel').hidden = true;
      document.getElementById('accountSuspensionPanel').hidden = true;
      document.getElementById('accountStatusErrorPanel').hidden = false;
      document.getElementById('accountStatusErrorText').textContent = error.message;
      gate.classList.remove('hidden');
      document.querySelector('.app-container').classList.add('hidden');
    }

    function startAccountStatusPolling() {
      if (accountStatusTimer) clearInterval(accountStatusTimer);
      accountStatusTimer = setInterval(async () => {
        if (!activeUserId || !authState.currentUser) return;
        try {
          const status = await loadAccountAccessStatus();
          if (status.status === 'suspended' || !status.termsAccepted) {
            await stopProfileAccess();
          }
        } catch (error) {
          setSyncStatus('Не удалось проверить статус аккаунта: ' + error.message, true);
        }
      }, 60000);
    }

    function setAccountAdminFeedback(message, isError) {
      const feedback = document.getElementById('accountAdminFeedback');
      feedback.textContent = message;
      feedback.classList.toggle('error', !!isError);
    }

    async function searchAdminAccounts() {
      const query = document.getElementById('accountSearchInput').value.trim();
      setAccountAdminFeedback('', false);
      if (query.length < 3) {
        setAccountAdminFeedback(window.AppI18n.t('Saisissez au moins 3 caractères.'), true);
        return;
      }
      try {
        const result = await accountModerationRequest({ action: 'search_accounts', query });
        adminAccounts = result.accounts || [];
        selectedAdminAccount = null;
        renderAdminAccounts();
      } catch (error) {
        setAccountAdminFeedback(error.message, true);
      }
    }

    function renderAdminAccounts() {
      const results = document.getElementById('accountSearchResults');
      results.replaceChildren();
      document.getElementById('selectedAccountPanel').hidden = !selectedAdminAccount;
      adminAccounts.forEach(account => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'account-search-result';
        button.dataset.accountTargetId = account.user_id;
        button.dataset.handlerClick = 'h69';
        button.textContent = `${account.email} — ${window.AppI18n.t(account.status === 'suspended' ? 'Suspendu' : 'Actif')}`;
        results.appendChild(button);
      });
      setAccountAdminFeedback(
        window.AppI18n.t('Comptes trouvés : ') + adminAccounts.length,
        false
      );
    }

    function selectAdminAccount(accountId) {
      selectedAdminAccount = adminAccounts.find(account => account.user_id === accountId) || null;
      const panel = document.getElementById('selectedAccountPanel');
      panel.hidden = !selectedAdminAccount;
      if (!selectedAdminAccount) return;
      document.getElementById('selectedAccountLabel').textContent = selectedAdminAccount.email;
      const roleLabels = {
        owner: 'Propriétaire',
        moderator: 'Délégué',
        user: 'Utilisateur'
      };
      const accountRole = selectedAdminAccount.role || 'user';
      document.getElementById('selectedAccountStatus').textContent =
        `${window.AppI18n.t('Statut : ')}${window.AppI18n.t(selectedAdminAccount.status === 'suspended' ? 'Suspendu' : 'Actif')} — ${window.AppI18n.t('Rôle : ')}${window.AppI18n.t(roleLabels[accountRole] || 'Utilisateur')}`;
      const isTargetOwner = accountRole === 'owner';
      document.getElementById('suspendAccountButton').hidden =
        isTargetOwner || selectedAdminAccount.status === 'suspended';
      document.getElementById('reactivateAccountButton').hidden =
        isTargetOwner || selectedAdminAccount.status !== 'suspended';
      const isOwner = accountAccess && accountAccess.role === 'owner';
      document.getElementById('grantModeratorButton').hidden =
        !isOwner || selectedAdminAccount.role === 'moderator' || selectedAdminAccount.role === 'owner';
      document.getElementById('revokeModeratorButton').hidden =
        !isOwner || selectedAdminAccount.role !== 'moderator';
      document.getElementById('moderationReason').value = '';
      document.getElementById('paymentPeriod').value = '';
      document.getElementById('paymentAmount').value = '';
      document.getElementById('paymentCurrency').value = '';
      document.getElementById('paymentDueDate').value = '';
      document.getElementById('paymentReason').value = '';
      setPaymentFeedback('', false);
      loadAccountPayments();
    }

    async function performAccountAdminAction(action, operation) {
      if (!selectedAdminAccount) return;
      const reason = document.getElementById('moderationReason').value.trim();
      if (!reason) {
        setAccountAdminFeedback(window.AppI18n.t('Un motif est obligatoire.'), true);
        document.getElementById('moderationReason').focus();
        return;
      }
      const confirmation = action === 'moderate_account'
        ? window.AppI18n.t(operation === 'suspend' ? 'Confirmer la suspension de ce compte ?' : 'Confirmer la réactivation de ce compte ?')
        : window.AppI18n.t(operation === 'grant' ? 'Confirmer cette délégation ?' : 'Confirmer la révocation de cette délégation ?');
      if (!window.confirm(confirmation)) return;
      try {
        const targetId = selectedAdminAccount.user_id;
        await accountModerationRequest({
          action,
          operation,
          targetId,
          reason
        });
        await searchAdminAccounts();
        const updatedAccount = adminAccounts.find(account => account.user_id === targetId);
        if (updatedAccount) selectAdminAccount(updatedAccount.user_id);
        await loadAdminAudit();
        setAccountAdminFeedback(window.AppI18n.t('Action enregistrée.'), false);
      } catch (error) {
        setAccountAdminFeedback(error.message, true);
      }
    }

    async function loadAdminAudit() {
      if (!accountAccess || !accountAccess.role) return;
      try {
        const result = await accountModerationRequest({ action: 'audit' });
        const list = document.getElementById('accountAuditList');
        list.replaceChildren();
        (result.entries || []).forEach(entry => {
          const item = document.createElement('li');
          const label = {
            suspended: 'Compte suspendu',
            reactivated: 'Compte réactivé',
            moderator_granted: 'Délégation accordée',
            moderator_revoked: 'Délégation révoquée'
          }[entry.action] || entry.action;
          item.textContent = `${new Date(entry.created_at).toLocaleString(currentLanguage)} — ${window.AppI18n.t(label)} — ${entry.target_email || 'Compte supprimé'} — ${entry.reason}`;
          list.appendChild(item);
        });
      } catch (error) {
        setAccountAdminFeedback(error.message, true);
      }
    }

    function setPaymentFeedback(message, isError) {
      const feedback = document.getElementById('paymentFeedback');
      feedback.textContent = message;
      feedback.classList.toggle('error', !!isError);
    }

    async function loadAccountPayments() {
      if (!selectedAdminAccount) return;
      const targetId = selectedAdminAccount.user_id;
      try {
        const result = await paymentNotificationRequest({
          action: 'list',
          targetId
        });
        if (!selectedAdminAccount || selectedAdminAccount.user_id !== targetId) return false;
        renderAccountPayments(result);
        return true;
      } catch (error) {
        setPaymentFeedback(error.message, true);
        return false;
      }
    }

    function renderAccountPayments(result) {
      const list = document.getElementById('paymentDueList');
      const auditList = document.getElementById('paymentAuditList');
      list.replaceChildren();
      auditList.replaceChildren();
      const payments = result.payments || [];
      if (!payments.length) {
        const empty = document.createElement('li');
        empty.textContent = window.AppI18n.t('Aucune échéance enregistrée.');
        list.appendChild(empty);
      }
      payments.forEach(payment => {
        const item = document.createElement('li');
        item.className = 'account-payment-item';
        const statusLabel = payment.status === 'paid' ? 'Payé'
          : payment.status === 'cancelled' ? 'Annulé' : 'À payer';
        const detail = document.createElement('span');
        detail.textContent = `${payment.billing_period.slice(0, 7)} — ${Number(payment.amount).toFixed(2)} ${payment.currency} — ${payment.due_date} — ${window.AppI18n.t(statusLabel)}`;
        item.appendChild(detail);

        const latestEmail = (result.emails || []).find(email => email.payment_id === payment.id);
        if (latestEmail) {
          const delivery = document.createElement('span');
          const labels = latestEmail.event_type === 'late_reminder'
            ? ['Rappel envoyé', 'Rappel en attente d’envoi']
            : latestEmail.event_type === 'receipt_void'
              ? ['E-mail de correction : envoyé', 'E-mail de correction : en attente d’envoi']
              : ['E-mail de reçu : envoyé', 'E-mail de reçu : en attente d’envoi'];
          const label = latestEmail.status === 'sent'
            ? labels[0]
            : latestEmail.status === 'skipped'
              ? 'E-mail ignoré'
              : latestEmail.status === 'sending'
                ? 'E-mail en cours d’envoi'
                : labels[1];
          delivery.textContent = latestEmail.last_error
            ? `${window.AppI18n.t('E-mail non envoyé : ')}${latestEmail.last_error}`
            : window.AppI18n.t(label);
          delivery.classList.toggle('error', !!latestEmail.last_error);
          item.appendChild(delivery);
        }

        if (payment.status !== 'cancelled') {
          const actions = document.createElement('div');
          actions.className = 'account-payment-actions';
          if (payment.status === 'due') {
            const paidButton = document.createElement('button');
            paidButton.type = 'button';
            paidButton.className = 'secondary';
            paidButton.dataset.paymentId = payment.id;
            paidButton.dataset.handlerClick = 'h73';
            paidButton.textContent = window.AppI18n.t('Marquer payé');
            actions.appendChild(paidButton);
          }
          const cancelButton = document.createElement('button');
          cancelButton.type = 'button';
          cancelButton.className = 'danger';
          cancelButton.dataset.paymentId = payment.id;
          cancelButton.dataset.handlerClick = 'h74';
          cancelButton.textContent = window.AppI18n.t('Annuler / corriger');
          actions.appendChild(cancelButton);
          item.appendChild(actions);
        }
        list.appendChild(item);
      });

      (result.audit || []).forEach(entry => {
        const item = document.createElement('li');
        const labels = {
          created: 'Échéance créée',
          updated: 'Échéance modifiée',
          paid: 'Paiement confirmé',
          cancelled: 'Paiement annulé'
        };
        item.textContent = `${new Date(entry.created_at).toLocaleString(currentLanguage)} — ${window.AppI18n.t(labels[entry.action] || entry.action)} — ${entry.reason}`;
        auditList.appendChild(item);
      });
    }

    async function saveAccountPaymentDue() {
      if (!selectedAdminAccount) return;
      const period = document.getElementById('paymentPeriod').value;
      const amount = Number(document.getElementById('paymentAmount').value);
      const currency = document.getElementById('paymentCurrency').value.trim().toUpperCase();
      const dueDate = document.getElementById('paymentDueDate').value;
      const reason = document.getElementById('paymentReason').value.trim();
      if (!period || !dueDate || !reason) {
        setPaymentFeedback(window.AppI18n.t('Remplissez tous les champs de l’échéance.'), true);
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        setPaymentFeedback(window.AppI18n.t('Le montant doit être supérieur à zéro.'), true);
        return;
      }
      if (!/^[A-Z]{3}$/.test(currency)) {
        setPaymentFeedback(window.AppI18n.t('Saisissez un code de devise en trois lettres majuscules.'), true);
        return;
      }
      try {
        await paymentNotificationRequest({
          action: 'save_due',
          targetId: selectedAdminAccount.user_id,
          period,
          amount,
          currency,
          dueDate,
          reason
        });
        if (await loadAccountPayments()) {
          setPaymentFeedback(window.AppI18n.t('Échéance enregistrée.'), false);
        }
      } catch (error) {
        setPaymentFeedback(error.message, true);
      }
    }

    async function updateAccountPayment(paymentId, action) {
      if (!selectedAdminAccount || !paymentId) return;
      const reason = document.getElementById('paymentReason').value.trim();
      if (!reason) {
        setPaymentFeedback(window.AppI18n.t('Un motif est obligatoire.'), true);
        document.getElementById('paymentReason').focus();
        return;
      }
      const confirmation = action === 'mark_paid'
        ? 'Confirmer l’enregistrement de ce paiement comme payé ?'
        : 'Confirmer l’annulation de cette échéance ?';
      if (!window.confirm(window.AppI18n.t(confirmation))) return;
      try {
        const result = await paymentNotificationRequest({ action, paymentId, reason });
        if (!await loadAccountPayments()) return;
        const feedback = action === 'mark_paid'
          ? 'Confirmation enregistrée; e-mail de reçu mis en file d’attente.'
          : result.emailQueued
            ? 'Paiement annulé; e-mail de correction mis en file d’attente.'
            : 'Échéance annulée.';
        setPaymentFeedback(window.AppI18n.t(feedback), false);
      } catch (error) {
        setPaymentFeedback(error.message, true);
      }
    }

    function markAccountPaymentPaid(paymentId) {
      return updateAccountPayment(paymentId, 'mark_paid');
    }

    function cancelAccountPayment(paymentId) {
      return updateAccountPayment(paymentId, 'cancel_due');
    }

    async function acceptAccountTerms() {
      const checkbox = document.getElementById('acceptAccountTerms');
      if (!checkbox.checked) return;
      const button = document.getElementById('acceptAccountTermsButton');
      button.disabled = true;
      clearAuthError('accountTermsError');
      try {
        await accountModerationRequest({
          action: 'accept_terms',
          accepted: true,
          language: currentLanguage
        });
        await applyAuthenticatedUser(authState.currentUser);
      } catch (error) {
        showAuthError('accountTermsError', error.message);
        button.disabled = false;
      }
    }

    async function retryAccountAccess() {
      if (!authState.currentUser) return;
      try {
        await applyAuthenticatedUser(authState.currentUser);
      } catch (error) {
        showAccountStatusFailure(error);
      }
    }

    function updateTermsAcceptButton(event) {
      if (event.target.id === 'acceptAccountTerms') {
        document.getElementById('acceptAccountTermsButton').disabled = !event.target.checked;
      }
    }

    function userSettingKey(key) {
      if (!authState.currentUser) throw new Error('Войдите в аккаунт, чтобы изменить настройки.');
      return `profili-a4:${authState.currentUser.id}:${key}`;
    }

    function getUserSetting(key) {
      return authState.currentUser ? localStorage.getItem(userSettingKey(key)) : null;
    }

    function setUserSetting(key, value) {
      localStorage.setItem(userSettingKey(key), value);
    }

    function removeUserSetting(key) {
      localStorage.removeItem(userSettingKey(key));
    }

    function setSyncStatus(message, isError) {
      const status = document.getElementById('syncStatusText');
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('error', !!isError);
    }

    function showAuthError(elementId, message) {
      const element = document.getElementById(elementId);
      if (!element) return;
      element.textContent = message;
      element.hidden = false;
      element.classList.add('show');
    }

    function clearAuthError(elementId) {
      const element = document.getElementById(elementId);
      if (!element) return;
      element.textContent = '';
      element.hidden = true;
      element.classList.remove('show');
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[character]);
    }

    function getSafeFontFamily(value) {
      const allowedFonts = [
        'Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New',
        'Comic Sans MS', 'Trebuchet MS', 'Arial Black'
      ];
      return allowedFonts.includes(value) ? value : 'Times New Roman';
    }

    function normalizeProfileSizes(sizes) {
      const defaults = {
        name: 29, phone: 23, date: 29, row: 24, totalPrice: 31, totalLabel: 27
      };
      return Object.keys(defaults).reduce((result, key) => {
        const value = Number(sizes && sizes[key]);
        result[key] = Number.isFinite(value) ? Math.min(80, Math.max(8, Math.round(value))) : defaults[key];
        return result;
      }, {});
    }

    // ✅ ФУНКЦИЯ ГЕНЕРИРУЕТ НОМ ФАЙЛА
    function generatePrintFileName(profile) {
      const personName = profile.name
        .trim()
        .replace(/[▾✓\s]+/g, '_')
        .substring(0, 40);

      const period = profile.dateRange
        .replace(/[^\w\s\-\.\/]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 30);

      return `${personName}__${period}`;
    }

    // ✅ ПРИМЕНИТЬ НОМ К ДОКУМЕНТУ
    function applyPrintFileName(profile) {
      const fileName = generatePrintFileName(profile);
      document.title = fileName;
      console.log('📄 Файл назван:', fileName);
    }

    // ✅ ПЕЧАТЬ С НОМ АВТОМАТИЧЕСКИЙ
    function printWithName() {
      if (!appState.currentProfileId) {
        alert('⚠️ Пожалуйста, выберите профиль');
        return;
      }

      saveProfile().then(saved => {
        if (!saved) {
          alert('Печать отменена: профиль не удалось сохранить.');
          return;
        }
        db.getProfile(appState.currentProfileId).then(profile => {
          if (profile) {
            applyPrintFileName(profile);
            const printFormat = document.getElementById('profilePrintFormat').value;
            let printRules = document.getElementById('profilePrintRules');
            if (printFormat === 'a6') {
              if (!printRules) {
                printRules = document.createElement('style');
                printRules.id = 'profilePrintRules';
                document.head.appendChild(printRules);
              }
              printRules.textContent = '@page { size: A6 portrait; margin: 0; }';
              document.body.classList.add('printing-profile-a6');
            }
            const restorePrintLayout = () => {
              document.body.classList.remove('printing-profile-a6');
              if (printRules) printRules.remove();
            };
            window.addEventListener('afterprint', restorePrintLayout, { once: true });
            setTimeout(() => {
              window.print();
              setTimeout(restorePrintLayout, 2000);
            }, 100);
          }
        }).catch(error => alert('Не удалось подготовить профиль к печати: ' + error.message));
      }).catch(error => alert('Не удалось сохранить профиль перед печатью: ' + error.message));
    }

    function openBatchExport() {
      renderBatchList();
      showModal('batchExportModal');
    }

    function renderBatchList() {
      const list = document.getElementById('batchList');
      list.innerHTML = '';
      
      appState.allProfiles.forEach(profile => {
        const div = document.createElement('div');
        div.className = 'batch-item';
        const isSelected = appState.batchSelectedProfiles.has(profile.id);
        
        div.innerHTML = `
          <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleBatchProfile(${profile.id})">
          <div class="batch-item-info">
            <div class="batch-item-name">${escapeHtml(profile.name)}</div>
            <div class="batch-item-period">${escapeHtml(profile.dateRange)}</div>
          </div>
        `;
        list.appendChild(div);
      });
      
      updateBatchStats();
    }

    function toggleBatchProfile(id) {
      if (appState.batchSelectedProfiles.has(id)) {
        appState.batchSelectedProfiles.delete(id);
      } else {
        appState.batchSelectedProfiles.add(id);
      }
      updateBatchStats();
    }

    function selectAllBatchProfiles() {
      appState.allProfiles.forEach(p => appState.batchSelectedProfiles.add(p.id));
      renderBatchList();
    }

    function deselectAllBatchProfiles() {
      appState.batchSelectedProfiles.clear();
      renderBatchList();
    }

    function calculatePeriodBreakdown() {
      const periodCounts = {};
      
      appState.allProfiles.forEach(p => {
        const period = p.dateRange;
        if (!periodCounts[period]) {
          periodCounts[period] = { total: 0, selected: 0 };
        }
        periodCounts[period].total++;
        
        if (appState.batchSelectedProfiles.has(p.id)) {
          periodCounts[period].selected++;
        }
      });
      
      return periodCounts;
    }

    function updateBatchStats() {
      const selected = appState.batchSelectedProfiles.size;
      document.getElementById('selectedCount').textContent = selected;
      
      const totalProfiles = appState.allProfiles.length;
      const remainingProfiles = CONFIG.MAX_PROFILES - totalProfiles;
      
      document.getElementById('totalExistingProfiles').textContent = totalProfiles;
      document.getElementById('remainingProfiles').textContent = remainingProfiles;
      
      const periodBreakdown = calculatePeriodBreakdown();
      const breakdownDiv = document.getElementById('periodBreakdown');
      
      if (Object.keys(periodBreakdown).length === 0) {
        breakdownDiv.innerHTML = '<p style="color: #999;">Нет профилей</p>';
      } else {
        breakdownDiv.innerHTML = Object.entries(periodBreakdown)
          .map(([period, counts]) => {
            const percentage = ((counts.total / totalProfiles) * 100).toFixed(1);
            const selectedBadge = counts.selected > 0 
              ? `<span style="color: #159b63; font-weight: bold;"> [${counts.selected}]</span>`
              : '';
            return `
              <div style="padding: 5px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold;">${escapeHtml(period)}</span>
                <span style="color: #666;">: ${counts.total} (${percentage}%)${selectedBadge}</span>
              </div>
            `;
          })
          .join('');
      }
      
      const selectedProfiles = [];
      const periods = {};
      
      appState.allProfiles.forEach(p => {
        if (appState.batchSelectedProfiles.has(p.id)) {
          selectedProfiles.push(p);
          const period = p.dateRange;
          periods[period] = (periods[period] || 0) + 1;
        }
      });
      
      const dominantPeriod = selected > 0 
        ? Object.keys(periods).reduce((a, b) => 
            periods[a] > periods[b] ? a : b, Object.keys(periods)[0])
        : '-';
      
      document.getElementById('dominantPeriod').textContent = dominantPeriod;
    }

    function extractNumber(text) {
      const match = text.match(/([+-]?)\s*(\d+(?:\s+\d+)*(?:[.,]\d+)?)/);
      if (!match) return 0;
      const sign = match[1] === '-' ? -1 : 1;
      const numberStr = match[2].replace(/\s+/g, '').replace(',', '.');
      return sign * parseFloat(numberStr);
    }

    function formatCurrency(number) {
      const formatted = number.toLocaleString('ru-RU', {
        minimumFractionDigits: number % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2
      });
      return formatted + ' ₽';
    }

    async function executeBatchPrint() {
      if (appState.batchSelectedProfiles.size === 0) {
        alert('❌ Пожалуйста, выберите хотя бы один профиль');
        return;
      }

      try {
        const selectedProfiles = [];
        appState.allProfiles.forEach(p => {
          if (appState.batchSelectedProfiles.has(p.id)) {
            selectedProfiles.push(p);
          }
        });

        closeModal('batchExportModal');
        await printBatchProfiles(selectedProfiles, document.getElementById('batchPrintFormat').value);
      } catch (error) {
        setSyncStatus('Erreur lors de la préparation de l’impression groupée : ' + error.message, true);
        alert('Impression groupée impossible : ' + error.message);
      }
    }

    async function printBatchProfiles(profiles, format) {
      if (!profiles.length) {
        alert('❌ Пожалуйста, выберите хотя бы один профиль');
        return;
      }
      const useA6 = format === 'a6';
      const area = document.getElementById('documentArea');
      const originalChildren = Array.from(area.childNodes);
      const originalProfileId = appState.currentProfileId;
      const saved = await saveProfile();
      if (!saved) throw new Error('Печать отменена: профиль не удалось сохранить.');

      const batch = document.createElement('div');
      batch.className = useA6 ? 'batch-a6-container' : 'batch-a4-container';
      const printRules = document.createElement('style');
      printRules.textContent = '@page { size: A4 portrait; margin: 0; }';
      document.head.appendChild(printRules);
      try {
        for (let index = 0; index < profiles.length; index++) {
          await selectProfile(profiles[index].id);
          const page = document.getElementById('page');
          if (!page) throw new Error('Une fiche sélectionnée est introuvable.');
          if (!useA6 || index % 4 === 0) {
            const sheet = document.createElement('section');
            sheet.className = useA6 ? 'batch-a6-sheet' : 'batch-a4-sheet';
            batch.appendChild(sheet);
          }
          const copy = page.cloneNode(true);
          copy.removeAttribute('id');
          copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
          if (useA6) {
            const slot = document.createElement('div');
            slot.className = 'batch-a6-slot';
            slot.appendChild(copy);
            batch.lastElementChild.appendChild(slot);
          } else {
            batch.lastElementChild.appendChild(copy);
          }
        }

        area.replaceChildren(batch);
        const printClass = useA6 ? 'printing-batch-a6' : 'printing-batch-a4';
        document.body.classList.add(printClass);
        let restored = false;
        const restore = async () => {
          if (restored) return;
          restored = true;
          document.body.classList.remove(printClass);
          printRules.remove();
          area.replaceChildren(...originalChildren);
          window.removeEventListener('afterprint', restore);
          if (originalProfileId !== null && appState.currentProfileId !== originalProfileId) {
            await selectProfile(originalProfileId);
          }
        };
        window.addEventListener('afterprint', restore, { once: true });
        window.print();
        await restore();
        appState.batchSelectedProfiles.clear();
      } catch (error) {
        document.body.classList.remove('printing-batch-a6', 'printing-batch-a4');
        printRules.remove();
        area.replaceChildren(...originalChildren);
        if (originalProfileId !== null && appState.currentProfileId !== originalProfileId) {
          await selectProfile(originalProfileId);
        }
        throw error;
      }
    }

    function updateElementSize(elementClass, value) {
      const page = document.getElementById('page');
      if (!page) return;
      
      const elements = page.querySelectorAll('.' + elementClass);
      elements.forEach(el => {
        el.style.fontSize = value + 'px';
      });
      
      document.getElementById(elementClass + 'SizeDisplay').textContent = value + 'px';
      appState.sizes[elementClass] = parseInt(value);
      saveProfileDebounced();
    }

    function updateFontSettings() {
      const fontFamily = document.getElementById('fontFamilySelect').value;
      appState.fontFamily = fontFamily;
      setUserSetting('fontFamily', fontFamily);
      document.getElementById('fontSelect').value = fontFamily;
      applyFont();
      saveProfileDebounced();
    }

    function updateFontLive() {
      const fontFamily = document.getElementById('fontSelect').value;
      appState.fontFamily = fontFamily;
      
      const page = document.getElementById('page');
      if (page) {
        page.style.fontFamily = fontFamily;
      }
      
      document.getElementById('fontFamilySelect').value = fontFamily;
      setUserSetting('fontFamily', fontFamily);
      saveProfileDebounced();
    }

    function applyFont() {
      const page = document.getElementById('page');
      if (page) {
        page.style.fontFamily = appState.fontFamily;
      }
    }

    async function updateGender() {
      const gender = document.getElementById('genderSelect').value;
      const genderLabels = { male: 'Мужчина', female: 'Женщина', other: 'Не указано' };
      
      const genderEl = document.getElementById('personGender');
      if (genderEl) {
        genderEl.dataset.genderValue = gender;
        genderEl.dataset.userEdited = 'false';
        genderEl.textContent = window.AppI18n.t(genderLabels[gender]);
      }
      
      const photo = document.getElementById('personPhoto');
      if (!photo) return;
      
      try {
        const profile = appState.currentProfileId && db
          ? await db.getProfile(appState.currentProfileId)
          : null;
        if (profile && profile.photoPath) {
          photo.src = await db.getPhotoUrl(profile.photoPath);
        } else {
          photo.src = appState.defaultPhotos[gender] || 'https://via.placeholder.com/112';
        }
      } catch (error) {
        setSyncStatus('Не удалось загрузить фото профиля: ' + error.message, true);
        alert('Не удалось загрузить фото профиля: ' + error.message);
      }
      saveProfileDebounced();
    }

    function updateCountry() {
      const country = document.getElementById('countrySelect').value;
      
      const countryEl = document.getElementById('personCountry');
      if (countryEl) {
        countryEl.dataset.countryValue = country;
        countryEl.dataset.userEdited = 'false';
        countryEl.textContent = country ? localizedCountryName(country) : window.AppI18n.t('Страна');
      }
      
      saveProfileDebounced();
    }

    function switchPage(page) {
      const landingPage = document.getElementById('landingPage');
      const appPage = document.getElementById('appPage');
      if (page === 'landing') {
        setA4UIReady(false);
        landingPage.style.display = 'block';
        appPage.classList.remove('show');
        document.querySelector('[data-page="landing"]').classList.add('active');
        document.querySelector('[data-page="app"]').classList.remove('active');
      } else if (page === 'app') {
        landingPage.style.display = 'none';
        appPage.classList.add('show');
        setA4UIReady(authState.isLoggedIn && !!document.getElementById('page'));
        document.querySelector('[data-page="landing"]').classList.remove('active');
        document.querySelector('[data-page="app"]').classList.add('active');
      }
    }

    function scrollToFeatures() {
      document.getElementById('featuresSection').scrollIntoView({ behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        switchPage(this.getAttribute('data-page'));
      });
    });

    function initializeCountries() {
      const select = document.getElementById('countrySelect');
      select.innerHTML = '<option value="">Выберите страну...</option>';
      Object.keys(COUNTRIES).forEach(continent => {
        const optgroup = document.createElement('optgroup');
        optgroup.dataset.sourceLabel = continent;
        optgroup.label = window.AppI18n.t(continent);
        Object.keys(COUNTRIES[continent]).forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = localizedCountryName(country);
          optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
      });
      updateCountryOptionLabels();
    }

    function toggleAdminSettings() {
      if (!authState.isLoggedIn || !accountAccess || accountAccess.status === 'suspended' || !accountAccess.termsAccepted) return;
      const panel = document.getElementById('adminSettingsPanel');
      const opening = !panel.classList.contains('show');
      if (opening) closeMobilePanels();
      panel.classList.toggle('show');
      panel.hidden = !opening;
      document.getElementById('adminSettingsBackdrop').hidden = !opening;
      document.body.classList.toggle('admin-settings-open', opening);
      if (opening && accountAccess && accountAccess.role) loadAdminAudit();
    }

    function loadDefaultPhoto(event, gender) {
      const file = event.target.files[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Поддерживаются только изображения JPEG, PNG и WebP.');
        return;
      }
      if (file.size > CONFIG.MAX_LOCAL_DEFAULT_IMAGE_SIZE) {
        alert('Локальное фото по умолчанию должно быть не больше 512 КБ.');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const base64Image = e.target.result;
          setUserSetting(`defaultPhoto_${gender}`, base64Image);
          appState.defaultPhotos[gender] = base64Image;
          const photoElement = document.getElementById(`photo${gender.charAt(0).toUpperCase() + gender.slice(1)}`);
          if (photoElement) photoElement.src = base64Image;
          alert('Фото сохранено на этом устройстве.');
        } catch (error) {
          alert('Не удалось сохранить локальное фото: ' + error.message);
        }
      };
      reader.onerror = () => alert('Не удалось прочитать файл изображения.');
      reader.readAsDataURL(file);
    }

    function switchColorMode() {
      const mode = document.getElementById('colorModeSelect').value;
      appState.colorMode = mode;
      if (mode === 'global') {
        document.getElementById('textColorAdmin').value = appState.colors.textColor;
        document.getElementById('greenColorAdmin').value = appState.colors.greenColor;
        document.getElementById('redColorAdmin').value = appState.colors.redColor;
        document.getElementById('cardBgColorAdmin').value = appState.colors.cardBgColor;
        document.getElementById('photoBorderColorAdmin').value = appState.colors.photoBorderColor;
        document.getElementById('totalBoxBgColorAdmin').value = appState.colors.totalBoxBgColor;
      } else if (mode === 'profile' && appState.currentProfileId) {
        const profileColors = appState.profileColors[appState.currentProfileId] || appState.colors;
        document.getElementById('textColorAdmin').value = profileColors.textColor || appState.colors.textColor;
        document.getElementById('greenColorAdmin').value = profileColors.greenColor || appState.colors.greenColor;
        document.getElementById('redColorAdmin').value = profileColors.redColor || appState.colors.redColor;
        document.getElementById('cardBgColorAdmin').value = profileColors.cardBgColor || appState.colors.cardBgColor;
        document.getElementById('photoBorderColorAdmin').value = profileColors.photoBorderColor || appState.colors.photoBorderColor;
        document.getElementById('totalBoxBgColorAdmin').value = profileColors.totalBoxBgColor || appState.colors.totalBoxBgColor;
      }
    }

    function updateColorSettings() {
      const colors = {
        textColor: document.getElementById('textColorAdmin').value,
        greenColor: document.getElementById('greenColorAdmin').value,
        redColor: document.getElementById('redColorAdmin').value,
        cardBgColor: document.getElementById('cardBgColorAdmin').value,
        photoBorderColor: document.getElementById('photoBorderColorAdmin').value,
        totalBoxBgColor: document.getElementById('totalBoxBgColorAdmin').value
      };
      if (appState.colorMode === 'global') {
        appState.colors = colors;
        setUserSetting('globalColors', JSON.stringify(colors));
      } else if (appState.colorMode === 'profile' && appState.currentProfileId) {
        appState.profileColors[appState.currentProfileId] = colors;
        setUserSetting('profileColors', JSON.stringify(appState.profileColors));
      }
      applyColors();
    }

    function applyColors() {
      const colors = appState.colorMode === 'profile' && appState.currentProfileId 
        ? (appState.profileColors[appState.currentProfileId] || appState.colors)
        : appState.colors;
      const page = document.getElementById('page');
      if (!page) return;
      page.style.color = colors.textColor;
      page.querySelectorAll('.green').forEach(el => el.style.color = colors.greenColor);
      page.querySelectorAll('.red').forEach(el => el.style.color = colors.redColor);
      page.querySelectorAll('.card').forEach(el => el.style.backgroundColor = colors.cardBgColor);
      const photo = page.querySelector('.person-photo');
      if (photo) photo.style.borderColor = colors.photoBorderColor;
      const totalBox = page.querySelector('.total-box');
      if (totalBox) totalBox.style.backgroundColor = colors.totalBoxBgColor;
    }

    function resetColorsToDefault() {
      if (confirm('Вы уверены?')) {
        appState.colors = {
          textColor: '#333333',
          greenColor: '#159b63',
          redColor: '#d72626',
          cardBgColor: '#ffffff',
          photoBorderColor: '#b40000',
          totalBoxBgColor: '#eef4fb'
        };
        if (appState.colorMode === 'profile' && appState.currentProfileId) {
          delete appState.profileColors[appState.currentProfileId];
          setUserSetting('profileColors', JSON.stringify(appState.profileColors));
        } else {
          removeUserSetting('globalColors');
        }
        switchColorMode();
        applyColors();
        alert('✅ Цвета сброшены');
      }
    }

    function exportColorsSettings() {
      const settingsData = {
        globalColors: appState.colors,
        profileColors: appState.profileColors
      };
      const dataStr = JSON.stringify(settingsData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `color_settings_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      alert('✅ Экспортировано');
    }

    function importColorsSettings() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const data = JSON.parse(event.target.result);
            if (data.globalColors) {
              appState.colors = data.globalColors;
              setUserSetting('globalColors', JSON.stringify(data.globalColors));
            }
            if (data.profileColors) {
              appState.profileColors = data.profileColors;
              setUserSetting('profileColors', JSON.stringify(data.profileColors));
            }
            switchColorMode();
            applyColors();
            alert('✅ Импортировано');
          } catch (error) {
            alert('❌ Ошибка');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    function loadUserSettings() {
      const malePhoto = getUserSetting('defaultPhoto_male');
      const femalePhoto = getUserSetting('defaultPhoto_female');
      const otherPhoto = getUserSetting('defaultPhoto_other');

      appState.defaultPhotos = { male: malePhoto, female: femalePhoto, other: otherPhoto };
      appState.colors = {
        textColor: '#333333',
        greenColor: '#159b63',
        redColor: '#d72626',
        cardBgColor: '#ffffff',
        photoBorderColor: '#b40000',
        totalBoxBgColor: '#eef4fb'
      };
      appState.profileColors = {};
      appState.fontFamily = 'Times New Roman';
      if (malePhoto) document.getElementById('photoMale').src = malePhoto;
      if (femalePhoto) document.getElementById('photoFemale').src = femalePhoto;
      if (otherPhoto) document.getElementById('photoOther').src = otherPhoto;

      const globalColors = getUserSetting('globalColors');
      const profileColors = getUserSetting('profileColors');
      const fontFamily = getUserSetting('fontFamily');
      if (globalColors) appState.colors = JSON.parse(globalColors);
      if (profileColors) appState.profileColors = JSON.parse(profileColors);
      if (fontFamily) {
        appState.fontFamily = fontFamily;
        document.getElementById('fontFamilySelect').value = fontFamily;
      }
      const savedLanguage = authState.currentUser.user_metadata?.application_language || getUserSetting('language');
      if (savedLanguage) changeLanguage(savedLanguage, { persistAccount: false });
      switchColorMode();
    }

    function getSupabaseClient() {
      if (!supabaseClient) throw new Error('Supabase не настроен. Заполните URL и публичный anon key в JS/supabase-config.js.');
      return supabaseClient;
    }

    function showLoginForm() {
      ['loginFormMain', 'registerForm', 'passwordRecoveryForm', 'passwordUpdateForm'].forEach(id => {
        document.getElementById(id).classList.toggle('hidden', id !== 'loginFormMain');
      });
    }

    function showPasswordRecovery() {
      clearAuthError('recoveryError');
      document.getElementById('passwordRecoveryForm').classList.remove('hidden');
      document.getElementById('loginFormMain').classList.add('hidden');
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('passwordUpdateForm').classList.add('hidden');
      document.getElementById('recoveryEmail').value = document.getElementById('loginEmail').value.trim();
    }

    function showPasswordUpdateForm() {
      passwordRecoveryInProgress = true;
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('landingPage').style.display = 'none';
      document.getElementById('appPage').classList.add('show');
      document.getElementById('passwordUpdateForm').classList.remove('hidden');
      document.getElementById('loginFormMain').classList.add('hidden');
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('passwordRecoveryForm').classList.add('hidden');
      switchPage('app');
    }

    async function applyAuthenticatedUser(user) {
      authState.currentUser = user;
      authState.isLoggedIn = true;
      document.getElementById('loginScreen').classList.add('hidden');
      const displayName = user.user_metadata?.full_name || user.email;
      document.getElementById('currentUser').dataset.i18nIgnore = 'true';
      document.getElementById('userBadge').dataset.i18nIgnore = 'true';
      document.getElementById('currentUser').textContent = displayName;
      document.getElementById('userBadge').textContent = displayName;
      document.getElementById('userBadge').classList.remove('admin');
      document.getElementById('headerLogoutButton').hidden = false;
      document.getElementById('landingPage').style.display = 'none';
      document.getElementById('appPage').classList.add('show');
      switchPage('app');

      if (activeUserId && activeUserId !== user.id) {
        document.querySelector('.app-container').classList.add('hidden');
        await stopProfileAccess();
      }

      try {
        await loadAccountAccessStatus();
      } catch (error) {
        if (!authState.currentUser || authState.currentUser.id !== user.id) return;
        await stopProfileAccess();
        showAccountStatusFailure(error);
        throw error;
      }

      if (!accountAccess.termsAccepted || accountAccess.status === 'suspended') {
        await stopProfileAccess();
        renderAccountAccess();
        return;
      }

      document.getElementById('accountAccessGate').classList.add('hidden');
      document.querySelector('.app-container').classList.remove('hidden');
      document.getElementById('accountStatusErrorPanel').hidden = true;

      if (activeUserId === user.id && db) return;

      if (realtimeChannel) {
        await supabaseClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      activeUserId = user.id;
      db = new ProfileDatabase(supabaseClient, user.id);
      try {
        loadUserSettings();
        setSyncStatus('Загрузка облачных профилей…', false);
        await initializeApp();
        await Promise.all([
          window.AppNotifications.initialize(supabaseClient, user.id, user.email),
          window.AppDocuments.initialize(supabaseClient, user.id)
        ]);
      } catch (error) {
        activeUserId = null;
        db = null;
        throw error;
      }
      realtimeChannel = db.subscribe(() => {
        if (appState.suppressProfileRealtime) return;
        loadProfiles().then(() => {
          if (appState.currentProfileId && !appState.saveTimeout) {
            return selectProfile(appState.currentProfileId);
          }
        }).catch(error => {
          console.error('Ошибка синхронизации:', error);
          setSyncStatus('Ошибка синхронизации: ' + error.message, true);
        });
      }, status => {
        if (status === 'SUBSCRIBED') setSyncStatus('Облако синхронизировано', false);
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('Нет связи с синхронизацией в реальном времени', true);
        }
      });
      startAccountStatusPolling();
    }

    async function clearAuthenticatedUser() {
      if (window.AppNotifications) await window.AppNotifications.reset();
      if (window.AppDocuments) await window.AppDocuments.reset();
      if (realtimeChannel && supabaseClient) {
        await supabaseClient.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
      if (appState.saveTimeout) clearTimeout(appState.saveTimeout);
      activeUserId = null;
      authState = { currentUser: null, isLoggedIn: false };
      accountAccess = null;
      accountAccessRequest = null;
      accountAccessRequestUserId = null;
      adminAccounts = [];
      selectedAdminAccount = null;
      db = null;
      if (accountStatusTimer) {
        clearInterval(accountStatusTimer);
        accountStatusTimer = null;
      }
      appState.allProfiles = [];
      appState.currentProfileId = null;
      appState.saveTimeout = null;
      appState.batchSelectedProfiles.clear();
      setA4UIReady(false);
      document.getElementById('documentArea').innerHTML = '';
      document.getElementById('profilesList').innerHTML = '';
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('accountAccessGate').classList.add('hidden');
      document.getElementById('accountStatusErrorPanel').hidden = true;
      document.querySelector('.app-container').classList.remove('hidden');
      document.getElementById('accountNoticeBanner').hidden = true;
      document.getElementById('accountModerationSection').hidden = true;
      document.getElementById('adminTabButton').hidden = true;
      document.getElementById('accountBillingSection').hidden = true;
      document.getElementById('accountDelegationSection').hidden = true;
      document.getElementById('accountSearchResults').replaceChildren();
      document.getElementById('selectedAccountPanel').hidden = true;
      document.getElementById('paymentDueList').replaceChildren();
      document.getElementById('paymentAuditList').replaceChildren();
      setPaymentFeedback('', false);
      document.getElementById('currentUser').dataset.i18nIgnore = 'false';
      document.getElementById('userBadge').dataset.i18nIgnore = 'false';
      document.getElementById('currentUser').textContent = 'Гость';
      document.getElementById('userBadge').textContent = 'Посетитель';
      document.getElementById('userBadge').classList.remove('admin');
      document.getElementById('headerLogoutButton').hidden = true;
      document.getElementById('loginPassword').value = '';
      document.getElementById('acceptAccountTerms').checked = false;
      document.getElementById('acceptAccountTermsButton').disabled = true;
      setSyncStatus('Не подключено', false);
      showLoginForm();
    }

    async function initializeSupabaseAuth() {
      const config = window.SUPABASE_CONFIG || {};
      const configNotice = document.getElementById('supabaseConfigStatus');
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        configNotice.textContent = 'Не удалось загрузить клиент Supabase. Проверьте подключение к интернету и перезагрузите страницу.';
        configNotice.hidden = false;
        configNotice.classList.add('show');
        return;
      }
      if (!config.url || !config.anonKey || /YOUR_|ваш_/i.test(config.url + config.anonKey)) {
        configNotice.textContent = 'Настройте URL проекта и публичный anon key в файле JS/supabase-config.js.';
        configNotice.hidden = false;
        configNotice.classList.add('show');
        return;
      }
      try {
        const projectUrl = new URL(config.url);
        const isLocalhost = ['localhost', '127.0.0.1'].includes(projectUrl.hostname);
        if (projectUrl.protocol !== 'https:' && !(isLocalhost && projectUrl.protocol === 'http:')) {
          throw new Error('URL Supabase должен использовать HTTPS.');
        }
        supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        supabaseClient.auth.onAuthStateChange((eventName, session) => {
          if (eventName === 'PASSWORD_RECOVERY') {
            showPasswordUpdateForm();
            return;
          }
          if (signupAcceptanceInProgress && session) return;
          if (passwordRecoveryInProgress && session) return;
          setTimeout(() => {
            if (session) {
              applyAuthenticatedUser(session.user).catch(error => {
                console.error('Ошибка загрузки профилей:', error);
                setSyncStatus('Не удалось загрузить профили: ' + error.message, true);
              });
            } else if (eventName === 'SIGNED_OUT') {
              clearAuthenticatedUser().catch(error => console.error('Ошибка выхода:', error));
            }
          }, 0);
        });
        if (data.session) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
          const queryParams = new URLSearchParams(window.location.search);
          if (hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery') {
            showPasswordUpdateForm();
            history.replaceState(null, document.title, window.location.pathname);
          } else {
            await applyAuthenticatedUser(data.session.user);
          }
        }
      } catch (error) {
        setSyncStatus('Не удалось подключиться к облаку: ' + error.message, true);
        if (!authState.isLoggedIn) {
          configNotice.textContent = 'Не удалось подключиться к Supabase: ' + error.message;
          configNotice.hidden = false;
          configNotice.classList.add('show');
        }
      }
    }

    class ProfileDatabase {
      constructor(client, userId) {
        this.client = client;
        this.userId = userId;
        this.table = 'profiles';
        this.bucket = 'profili-a4-profile-photos';
      }

      profileFromRow(row) {
        return { ...row.data, id: Number(row.id) };
      }

      profilePayload(profile) {
        const { id, photoImage, shareToken, user_id, userId, ...data } = profile;
        return data;
      }

      async addProfile(profile) {
        const { data, error } = await this.client.from(this.table)
          .insert({ id: Number(profile.id), user_id: this.userId, data: this.profilePayload(profile) })
          .select('id,data').single();
        if (error) throw error;
        return this.profileFromRow(data);
      }

      async updateProfile(profile) {
        const { data, error } = await this.client.from(this.table)
          .update({ data: this.profilePayload(profile) })
          .eq('user_id', this.userId).eq('id', Number(profile.id))
          .select('id,data').maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Профиль не найден или доступ к нему запрещен.');
        return this.profileFromRow(data);
      }

      async getProfile(id) {
        const { data, error } = await this.client.from(this.table).select('id,data')
          .eq('user_id', this.userId).eq('id', Number(id)).maybeSingle();
        if (error) throw error;
        return data ? this.profileFromRow(data) : null;
      }

      async getAllProfiles() {
        const { data, error } = await this.client.from(this.table).select('id,data')
          .eq('user_id', this.userId).is('data->>archivedAt', null)
          .limit(CONFIG.MAX_PROFILES);
        if (error) throw error;
        return data.map(row => this.profileFromRow(row)).filter(profile => !profile.archivedAt);
      }

      async getArchivedProfiles() {
        const { data, error } = await this.client.from(this.table).select('id,data')
          .eq('user_id', this.userId).not('data->>archivedAt', 'is', null);
        if (error) throw error;
        return data.map(row => this.profileFromRow(row));
      }

      async countProfiles() {
        const { count, error } = await this.client.from(this.table)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', this.userId).is('data->>archivedAt', null);
        if (error) throw error;
        return count || 0;
      }

      async uploadPhoto(profileId, file) {
        const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
        const extension = extensions[file.type];
        if (!extension) throw new Error('Формат фото должен быть JPEG, PNG или WebP.');
        if (file.size > CONFIG.MAX_IMAGE_SIZE) throw new Error('Изображение слишком велико (максимум 20 МБ).');
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const path = `${this.userId}/${profileId}/${fileName}`;
        const { error } = await this.client.storage.from(this.bucket).upload(path, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
        if (error) throw error;
        return path;
      }

      async getPhotoUrl(path) {
        const { data, error } = await this.client.storage.from(this.bucket).createSignedUrl(path, 3600);
        if (error) throw error;
        return data.signedUrl;
      }

      async removePhotos(paths) {
        const uniquePaths = [...new Set(paths.filter(Boolean))];
        if (uniquePaths.length === 0) return;
        const { error } = await this.client.storage.from(this.bucket).remove(uniquePaths);
        if (error) throw error;
      }

      async archiveProfile(id) {
        const profile = await this.getProfile(id);
        if (!profile) throw new Error('Профиль не найден.');
        profile.archivedAt = new Date().toISOString();
        await this.updateProfile(profile);
      }

      async restoreProfile(id) {
        const profile = await this.getProfile(id);
        if (!profile || !profile.archivedAt) throw new Error('Архивный профиль не найден.');
        delete profile.archivedAt;
        await this.updateProfile(profile);
      }

      async archiveAllProfiles() {
        const profiles = await this.getAllProfiles();
        const archivedAt = new Date().toISOString();
        for (const profile of profiles) {
          profile.archivedAt = archivedAt;
          await this.updateProfile(profile);
        }
      }

      subscribe(onChange, onStatus) {
        return this.client.channel(`profiles:${this.userId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: this.table,
            filter: `user_id=eq.${this.userId}`
          }, onChange)
          .subscribe(onStatus);
      }
    }

    async function loginUser() {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      clearAuthError('loginError');
      if (!email || !password) {
        showAuthError('loginError', 'Заполните email и пароль.');
        return;
      }
      try {
        const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (error) {
        showAuthError('loginError', error.message);
      }
    }

    async function registerUser() {
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const password2 = document.getElementById('regPassword2').value;
      clearAuthError('registerError');
      if (!document.getElementById('acceptSignupTerms').checked) {
        showAuthError('registerError', window.AppI18n.t('Vous devez accepter les Conditions générales d’utilisation v1.0.'));
        return;
      }
      if (!name || !email || !password || !password2) {
        showAuthError('registerError', 'Заполните все поля.');
        return;
      }
      if (password !== password2) {
        showAuthError('registerError', 'Пароли не совпадают.');
        return;
      }
      if (password.length < 6) {
        showAuthError('registerError', 'Минимальная длина пароля — 6 символов.');
        return;
      }
      let signupUser = null;
      try {
        signupAcceptanceInProgress = true;
        const redirectTo = window.location.origin + window.location.pathname;
        const { data, error } = await getSupabaseClient().auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: redirectTo
          }
        });
        if (error) throw error;
        if (data.session) {
          signupUser = data.session.user;
          await accountModerationRequest({
            action: 'accept_terms',
            accepted: true,
            language: currentLanguage
          });
          await applyAuthenticatedUser(signupUser);
        } else {
          showAuthError('registerError', 'Проверьте почту, подтвердите адрес, затем войдите и примите условия.');
        }
      } catch (error) {
        signupAcceptanceInProgress = false;
        if (signupUser && !authState.currentUser) {
          try {
            await applyAuthenticatedUser(signupUser);
            showAuthError('accountTermsError', error.message);
          } catch (accessError) {
            console.error('Не удалось продолжить регистрацию после ошибки согласия:', accessError);
          }
          return;
        }
        showAuthError('registerError', error.message);
      } finally {
        signupAcceptanceInProgress = false;
      }
    }

    async function sendPasswordRecovery() {
      const email = document.getElementById('recoveryEmail').value.trim();
      clearAuthError('recoveryError');
      if (!email) {
        showAuthError('recoveryError', 'Введите email.');
        return;
      }
      try {
        const redirectTo = window.location.origin + window.location.pathname;
        const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        showAuthError('recoveryError', 'Если аккаунт существует, на его почту отправлена ссылка для сброса пароля.');
      } catch (error) {
        showAuthError('recoveryError', error.message);
      }
    }

    async function updatePassword() {
      const password = document.getElementById('newPassword').value;
      const confirmation = document.getElementById('newPasswordConfirm').value;
      clearAuthError('passwordUpdateError');
      if (password.length < 6) {
        showAuthError('passwordUpdateError', 'Минимальная длина пароля — 6 символов.');
        return;
      }
      if (password !== confirmation) {
        showAuthError('passwordUpdateError', 'Пароли не совпадают.');
        return;
      }
      try {
        const { data, error } = await getSupabaseClient().auth.updateUser({ password });
        if (error) throw error;
        document.getElementById('passwordUpdateForm').classList.add('hidden');
        passwordRecoveryInProgress = false;
        await applyAuthenticatedUser(data.user);
        alert('Пароль успешно изменен.');
      } catch (error) {
        showAuthError('passwordUpdateError', error.message);
      }
    }

    async function logoutUser() {
      if (!confirm('Выйти?')) return;
      try {
        if (appState.saveTimeout) {
          clearTimeout(appState.saveTimeout);
          appState.saveTimeout = null;
          if (!await saveProfile()) throw new Error('Сначала устраните ошибку сохранения профиля.');
        }
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) throw error;
        await clearAuthenticatedUser();
      } catch (error) {
        alert('Не удалось выйти: ' + error.message);
      }
    }

    function toggleRegisterForm() {
      const registerForm = document.getElementById('registerForm');
      const showRegister = registerForm.classList.contains('hidden');
      if (!showRegister) document.getElementById('acceptSignupTerms').checked = false;
      ['loginFormMain', 'registerForm', 'passwordRecoveryForm', 'passwordUpdateForm'].forEach(id => {
        document.getElementById(id).classList.toggle('hidden', (id === 'registerForm') !== showRegister);
      });
      clearAuthError('registerError');
      clearAuthError('loginError');
    }

    async function loadImage(event) {
      const file = event.target.files[0];
      if (!file) return;
      event.target.value = '';
      if (!db || !appState.currentProfileId) {
        alert('Сначала войдите и выберите профиль.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Поддерживаются только изображения JPEG, PNG и WebP.');
        return;
      }
      if (file.size > CONFIG.MAX_IMAGE_SIZE) {
        alert('Изображение слишком велико (максимум 20 МБ).');
        return;
      }
      let uploadedPath = null;
      try {
        const profile = await db.getProfile(appState.currentProfileId);
        if (!profile) throw new Error('Профиль не найден.');
        uploadedPath = await db.uploadPhoto(profile.id, file);
        const signedUrl = await db.getPhotoUrl(uploadedPath);
        const oldPath = profile.photoPath;
        profile.photoPath = uploadedPath;
        profile.lastModified = new Date();
        await db.updateProfile(profile);
        document.getElementById('personPhoto').src = signedUrl;
        updateStorageInfo();
        setSyncStatus('Фото загружено и сохранено', false);
        if (oldPath) {
          try {
            await db.removePhotos([oldPath]);
          } catch (error) {
            alert('Фото профиля сохранено, но предыдущий файл не удалось удалить: ' + error.message);
          }
        }
      } catch (error) {
        if (uploadedPath) {
          try {
            await db.removePhotos([uploadedPath]);
          } catch (cleanupError) {
            console.error('Не удалось удалить незавершенную загрузку:', cleanupError);
          }
        }
        setSyncStatus('Ошибка загрузки фото: ' + error.message, true);
        alert('Не удалось сохранить фото: ' + error.message);
      }
    }

    async function initializeApp() {
      setA4UIReady(false);
      initializeCountries();
      await loadProfiles();
      await updateStorageInfo();
    }

    async function createNewProfile() {
      try {
        appState.showArchivedProfiles = false;
        const count = await db.countProfiles();
        if (count >= CONFIG.MAX_PROFILES) {
          alert(`❌ ${window.AppI18n.t('Достигнут лимит')} ${CONFIG.MAX_PROFILES} ${window.AppI18n.t('профилей')}`);
          return;
        }
        const newProfile = {
          id: Date.now(),
          name: ' ▾',
          phone: window.AppI18n.t('Телефон не указан'),
          gender: 'other',
          country: '',
          dateRange: '01/06/2026 - 07/06/2026',
          orderQuantity: window.AppI18n.t('Количество'),
          orderQuantityValue: window.AppI18n.t('не указано'),
          orderSum: ' ₽',
          bonuses: '+0 ₽',
          fines: '-0 ₽',
          totalPrice: '0 ₽',
          photoPath: null,
          fontFamily: 'Times New Roman',
          fontSettings: JSON.parse(JSON.stringify(appState.fontSettings)),
          sizes: JSON.parse(JSON.stringify(appState.sizes)),
          lastModified: new Date()
        };
        await db.addProfile(newProfile);
        await loadProfiles();
        await selectProfile(newProfile.id);
        updateStorageInfo();
      } catch (error) {
        alert('❌ Ошибка: ' + error.message);
      }
    }

    async function loadProfiles() {
      appState.allProfiles = await db.getAllProfiles();
      appState.allProfiles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      renderProfilesList();
      if (appState.allProfiles.length === 0) {
        appState.currentProfileId = null;
        displayEmptyState();
      } else if (!appState.currentProfileId) {
        await selectProfile(appState.allProfiles[0].id);
      }
    }

    function renderProfilesList() {
      const list = document.getElementById('profilesList');
      const searchBox = document.getElementById('searchBox');
      const profiles = appState.showArchivedProfiles ? appState.archivedProfiles : appState.allProfiles;
      const archiveButton = document.getElementById('btnProfileArchive');
      archiveButton.textContent = appState.showArchivedProfiles ? 'Profils actifs' : 'Archive';
      archiveButton.setAttribute('aria-pressed', String(appState.showArchivedProfiles));
      if (profiles.length === 0) {
        list.classList.add('empty');
        list.textContent = appState.showArchivedProfiles ? 'L’archive est vide.' : 'Нет профилей';
        searchBox.classList.toggle('show', !appState.showArchivedProfiles && appState.allProfiles.length > 0);
        document.getElementById('btnBatchExport').style.display = 'none';
        return;
      }
      list.classList.remove('empty');
      searchBox.classList.toggle('show', !appState.showArchivedProfiles);
      document.getElementById('btnBatchExport').style.display = appState.showArchivedProfiles ? 'none' : 'inline-block';
      list.innerHTML = '';
      profiles.forEach(profile => {
        const div = document.createElement('div');
        div.className = `profile-item ${!appState.showArchivedProfiles && profile.id === appState.currentProfileId ? 'active' : ''}`;
        if (!appState.showArchivedProfiles) {
          div.onclick = () => selectProfile(profile.id).catch(error => {
            setSyncStatus('Не удалось открыть профиль: ' + error.message, true);
            alert('Не удалось открыть профиль: ' + error.message);
          });
        }
        div.innerHTML = `
          <div class="profile-item-content">
            <div class="profile-item-name">${escapeHtml(profile.name)}</div>
            <div class="profile-item-date">${escapeHtml(profile.dateRange)}${appState.showArchivedProfiles ? ` · ${new Date(profile.archivedAt).toLocaleDateString()}` : ''}</div>
          </div>
        `;
        if (appState.showArchivedProfiles) {
          const restore = document.createElement('button');
          restore.type = 'button';
          restore.className = 'profile-restore-button';
          restore.textContent = 'Restaurer';
          restore.addEventListener('click', event => {
            event.stopPropagation();
            restoreProfile(profile.id);
          });
          div.appendChild(restore);
        }
        list.appendChild(div);
      });
    }

    async function toggleProfileArchiveView() {
      appState.showArchivedProfiles = !appState.showArchivedProfiles;
      try {
        if (appState.showArchivedProfiles) {
          appState.archivedProfiles = await db.getArchivedProfiles();
          appState.archivedProfiles.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
        }
        renderProfilesList();
      } catch (error) {
        appState.showArchivedProfiles = false;
        setSyncStatus('Impossible de charger l’archive des profils : ' + error.message, true);
        alert('Impossible d’ouvrir l’archive : ' + error.message);
      }
    }

    async function restoreProfile(id) {
      try {
        await db.restoreProfile(id);
        appState.archivedProfiles = appState.archivedProfiles.filter(profile => profile.id !== Number(id));
        await loadProfiles();
        await updateStorageInfo();
        renderProfilesList();
      } catch (error) {
        setSyncStatus('Не удалось восстановить профиль: ' + error.message, true);
        alert('Не удалось восстановить профиль: ' + error.message);
      }
    }

    function displayEmptyState() {
      setA4UIReady(false);
      document.getElementById('documentArea').innerHTML = `
        <div class="empty-state">
          <div class="empty-state-content">
            <span class="empty-state-icon">📋</span>
            <h2>Добро пожаловать!</h2>
            <p>Нет профилей</p>
            <button class="create-btn" onclick="createNewProfile()">➕ Новое</button>
          </div>
        </div>
      `;
      document.getElementById('btnDelete').style.display = 'none';
      document.getElementById('btnBatchExport').style.display = 'none';
    }

    async function selectProfile(id) {
      if (appState.saveTimeout) {
        clearTimeout(appState.saveTimeout);
        appState.saveTimeout = null;
        if (!await saveProfile()) throw new Error('Не удалось сохранить текущий профиль.');
      }
      appState.currentProfileId = id;
      const profile = await db.getProfile(id);
      if (!profile) {
        appState.currentProfileId = null;
        await loadProfiles();
        return;
      }
      {
        document.getElementById('genderSelect').value = profile.gender || 'male';
        document.getElementById('countrySelect').value = profile.country || '';
        const fontFamily = getSafeFontFamily(profile.fontFamily);
        document.getElementById('fontSelect').value = fontFamily;
        appState.fontFamily = fontFamily;
        
        appState.sizes = normalizeProfileSizes(profile.sizes);

        const photoSrc = profile.photoPath
          ? await db.getPhotoUrl(profile.photoPath)
          : appState.defaultPhotos[profile.gender || 'male'] || 'https://via.placeholder.com/112';
        const genderSource = profile.gender === 'male' ? 'Мужчина'
          : profile.gender === 'female' ? 'Женщина'
          : 'Не указано';
        const genderLabel = window.AppI18n.t(genderSource);
        const countryLabel = profile.country
          ? localizedCountryName(profile.country)
          : window.AppI18n.t('Страна');
        document.getElementById('documentArea').innerHTML = `
          <div class="a4-wrapper">
            <div class="a4" id="page" style="font-family: ${escapeHtml(fontFamily)}">
              <div class="card top">
                <div class="person-info">
                  <div class="name" contenteditable="true" id="personName" oninput="saveProfileDebounced()" style="font-size: ${appState.sizes.name}px">${escapeHtml(profile.name)}</div>
                  <div class="phone" contenteditable="true" id="personPhone" oninput="saveProfileDebounced()" style="font-size: ${appState.sizes.phone}px">${escapeHtml(profile.phone)}</div>
                  <div class="person-details">
                    <span contenteditable="true" id="personGender" data-gender-value="${escapeHtml(profile.gender || 'other')}" oninput="this.dataset.userEdited='true'; saveProfileDebounced()">${genderLabel}</span>
                    <span> • </span>
                    <span contenteditable="true" id="personCountry" data-country-value="${escapeHtml(profile.country || '')}" oninput="this.dataset.userEdited='true'; saveProfileDebounced()">${escapeHtml(countryLabel)}</span>
                  </div>
                </div>
                <img id="personPhoto" class="person-photo" src="${escapeHtml(photoSrc)}" alt="Фото профиля" onclick="document.getElementById('photoInput').click()">
              </div>
              <div class="card">
                <div class="date" contenteditable="true" id="dateRange" oninput="saveProfileDebounced()" style="font-size: ${appState.sizes.date}px">${escapeHtml(profile.dateRange)}</div>
                <div class="row" style="font-size: ${appState.sizes.row}px">
                  <span contenteditable="true" id="orderQuantity" oninput="saveProfileDebounced()">${escapeHtml(profile.orderQuantity)}</span>
                  <span contenteditable="true" id="orderQuantityValue" oninput="saveProfileDebounced()">${escapeHtml(profile.orderQuantityValue)}</span>
                </div>
                <div class="row" style="font-size: ${appState.sizes.row}px">
                  <span>Сумма</span>
                  <span contenteditable="true" id="orderSum" oninput="calculateTotal(); saveProfileDebounced()">${escapeHtml(profile.orderSum)}</span>
                </div>
                <div class="row" style="font-size: ${appState.sizes.row}px">
                  <span>Бонусы</span>
                  <span class="green" contenteditable="true" id="bonuses" oninput="calculateTotal(); saveProfileDebounced()">${escapeHtml(profile.bonuses)}</span>
                </div>
                <div class="row" style="font-size: ${appState.sizes.row}px">
                  <span>Штрафы</span>
                  <span class="red" contenteditable="true" id="fines" oninput="calculateTotal(); saveProfileDebounced()">${escapeHtml(profile.fines)}</span>
                </div>
                <div class="total-box">
                  <span class="total-label" style="font-size: ${appState.sizes.totalLabel}px">ИТОГО</span>
                  <span class="total-price" style="font-size: ${appState.sizes.totalPrice}px" id="totalPrice">${escapeHtml(profile.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // La fiche A4 vient d'être créée dans le DOM : on déverrouille les icônes.
        setA4UIReady(true);
        observeA4Layout();

        document.getElementById('nameSize').value = appState.sizes.name;
        document.getElementById('nameSizeDisplay').textContent = appState.sizes.name + 'px';
        
        document.getElementById('phoneSize').value = appState.sizes.phone;
        document.getElementById('phoneSizeDisplay').textContent = appState.sizes.phone + 'px';
        
        document.getElementById('dateSize').value = appState.sizes.date;
        document.getElementById('dateSizeDisplay').textContent = appState.sizes.date + 'px';
        
        document.getElementById('rowSize').value = appState.sizes.row;
        document.getElementById('rowSizeDisplay').textContent = appState.sizes.row + 'px';
        
        document.getElementById('totalSize').value = appState.sizes.totalPrice;
        document.getElementById('totalSizeDisplay').textContent = appState.sizes.totalPrice + 'px';
        
        document.getElementById('labelSize').value = appState.sizes.totalLabel;
        document.getElementById('labelSizeDisplay').textContent = appState.sizes.totalLabel + 'px';
        
        applyColors();
        renderProfilesList();
        document.getElementById('btnDelete').style.display = 'inline-block';
        calculateTotal();
      }
    }

    async function saveProfile() {
      if (!appState.currentProfileId || !db) return false;
      try {
        const profile = await db.getProfile(appState.currentProfileId);
        if (!profile) return false;
        profile.name = document.getElementById('personName').innerText;
        profile.phone = document.getElementById('personPhone').innerText;
        profile.dateRange = document.getElementById('dateRange').innerText;
        profile.orderQuantity = document.getElementById('orderQuantity').innerText;
        profile.orderQuantityValue = document.getElementById('orderQuantityValue').innerText;
        profile.orderSum = document.getElementById('orderSum').innerText;
        profile.bonuses = document.getElementById('bonuses').innerText;
        profile.fines = document.getElementById('fines').innerText;
        profile.totalPrice = document.getElementById('totalPrice').innerText;
        profile.gender = document.getElementById('genderSelect').value;
        profile.country = document.getElementById('countrySelect').value;
        profile.fontFamily = appState.fontFamily;
        profile.fontSettings = JSON.parse(JSON.stringify(appState.fontSettings));
        profile.sizes = JSON.parse(JSON.stringify(appState.sizes));
        profile.lastModified = new Date();
        await db.updateProfile(profile);
        await loadProfiles();
        await updateStorageInfo();
        setSyncStatus('Изменения сохранены', false);
        return true;
      } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        setSyncStatus('Ошибка сохранения: ' + error.message, true);
        return false;
      }
    }

    function saveProfileDebounced() {
      clearTimeout(appState.saveTimeout);
      setSyncStatus('Сохранение…', false);
      appState.saveTimeout = setTimeout(() => {
        appState.saveTimeout = null;
        saveProfile();
      }, CONFIG.SAVE_DEBOUNCE_MS);
    }

    async function deleteCurrentProfile() {
      if (!appState.currentProfileId) return;
      try {
        const profile = await db.getProfile(appState.currentProfileId);
        if (!profile) return;
        appState.profileToDelete = profile;
        document.getElementById('deleteMessage').innerHTML = `<span>Archiver</span> "<strong>${escapeHtml(profile.name)}</strong>" ?`;
        showModal('deleteModal');
      } catch (error) {
        setSyncStatus('Не удалось загрузить профиль: ' + error.message, true);
        alert('Не удалось загрузить профиль: ' + error.message);
      }
    }

    async function confirmDeleteProfile() {
      if (!appState.profileToDelete) return;
      try {
        if (appState.saveTimeout) {
          clearTimeout(appState.saveTimeout);
          appState.saveTimeout = null;
          if (!await saveProfile()) throw new Error('Enregistrez les modifications avant d’archiver cette fiche.');
        }
        await db.archiveProfile(appState.profileToDelete.id);
        appState.currentProfileId = null;
        appState.profileToDelete = null;
        appState.showArchivedProfiles = false;
        await loadProfiles();
        await updateStorageInfo();
        closeModal('deleteModal');
      } catch (error) {
        setSyncStatus('Impossible d’archiver le profil : ' + error.message, true);
        alert('Impossible d’archiver le profil : ' + error.message);
      }
    }

    async function resetDatabase() {
      try {
        const count = await db.countProfiles();
        document.getElementById('profileCountToReset').innerText = count;
        showModal('resetModal');
      } catch (error) {
        setSyncStatus('Не удалось проверить базу профилей: ' + error.message, true);
        alert('Не удалось проверить базу профилей: ' + error.message);
      }
    }

    async function confirmResetDatabase() {
      try {
        if (appState.saveTimeout) {
          clearTimeout(appState.saveTimeout);
          appState.saveTimeout = null;
          if (!await saveProfile()) throw new Error('Enregistrez les modifications avant d’archiver les profils.');
        }
        appState.suppressProfileRealtime = true;
        try {
          await db.archiveAllProfiles();
        } finally {
          appState.suppressProfileRealtime = false;
        }
        appState.currentProfileId = null;
        appState.showArchivedProfiles = false;
        await loadProfiles();
        await updateStorageInfo();
        closeModal('resetModal');
        alert('Профили перемещены в архив. Вы можете восстановить их через кнопку «Архив».');
      } catch (error) {
        setSyncStatus('Impossible d’archiver les profils : ' + error.message, true);
        alert('Impossible d’archiver les profils : ' + error.message);
      }
    }

    async function exportDatabase() {
      try {
        const activeProfiles = await db.getAllProfiles();
        const archivedProfiles = await db.getArchivedProfiles();
        const allData = [...activeProfiles, ...archivedProfiles];
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profiles_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('Экспорт профилей завершен. Фотографии хранятся отдельно в приватном облачном хранилище.');
      } catch (error) {
        alert('Не удалось экспортировать профили: ' + error.message);
      }
    }

    async function importDatabaseBackup(event) {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) {
        alert('Файл резервной копии слишком велик (максимум 50 МБ).');
        return;
      }

      try {
        const profiles = JSON.parse(await file.text());
        if (!Array.isArray(profiles)) throw new Error('Ожидается JSON-массив профилей.');
        const existingCount = await db.countProfiles();
        const incomingActiveCount = profiles.filter(profile => profile && !profile.archivedAt).length;
        if (existingCount + incomingActiveCount > CONFIG.MAX_PROFILES) {
          throw new Error(`Можно хранить не более ${CONFIG.MAX_PROFILES} профилей на аккаунт.`);
        }

        const activeProfiles = await db.getAllProfiles();
        const archivedProfiles = await db.getArchivedProfiles();
        const existingProfiles = [...activeProfiles, ...archivedProfiles];
        const usedIds = new Set(existingProfiles.map(profile => profile.id));
        let nextId = Date.now() * 1000;
        let imported = 0;
        const errors = [];
        for (const oldProfile of profiles) {
          if (!oldProfile || typeof oldProfile !== 'object' || Array.isArray(oldProfile)) {
            errors.push('Пропущена запись с неверным форматом.');
            continue;
          }
          while (usedIds.has(nextId)) nextId++;
          const id = nextId++;
          usedIds.add(id);
          const gender = ['male', 'female', 'other'].includes(oldProfile.gender) ? oldProfile.gender : 'other';
          const profile = {
            id,
            name: String(oldProfile.name || ' ▾').slice(0, 200),
            phone: String(oldProfile.phone || '').slice(0, 100),
            gender,
            country: String(oldProfile.country || '').slice(0, 100),
            dateRange: String(oldProfile.dateRange || '').slice(0, 200),
            orderQuantity: String(oldProfile.orderQuantity || '').slice(0, 100),
            orderQuantityValue: String(oldProfile.orderQuantityValue || '').slice(0, 100),
            orderSum: String(oldProfile.orderSum || '').slice(0, 100),
            bonuses: String(oldProfile.bonuses || '').slice(0, 100),
            fines: String(oldProfile.fines || '').slice(0, 100),
            totalPrice: String(oldProfile.totalPrice || '').slice(0, 100),
            photoPath: null,
            fontFamily: getSafeFontFamily(oldProfile.fontFamily),
            fontSettings: oldProfile.fontSettings && typeof oldProfile.fontSettings === 'object' ? oldProfile.fontSettings : {},
            sizes: normalizeProfileSizes(oldProfile.sizes),
            lastModified: new Date().toISOString(),
            ...(typeof oldProfile.archivedAt === 'string' && !Number.isNaN(Date.parse(oldProfile.archivedAt))
              ? { archivedAt: oldProfile.archivedAt }
              : {})
          };
          let uploadedPath = null;
          try {
            if (oldProfile.photoImage != null) {
              if (typeof oldProfile.photoImage !== 'string' ||
                  !/^data:image\/(jpeg|png|webp);base64,/i.test(oldProfile.photoImage)) {
                throw new Error('Фото имеет неподдерживаемый формат.');
              }
              const response = await fetch(oldProfile.photoImage);
              const photo = await response.blob();
              if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > CONFIG.MAX_IMAGE_SIZE) {
                throw new Error('Фото имеет неподдерживаемый формат или превышает 20 МБ.');
              }
              uploadedPath = await db.uploadPhoto(id, photo);
              profile.photoPath = uploadedPath;
            }
            await db.addProfile(profile);
            imported++;
          } catch (error) {
            if (uploadedPath) {
              try {
                await db.removePhotos([uploadedPath]);
              } catch (cleanupError) {
                console.error('Не удалось удалить фото неимпортированной записи:', cleanupError);
                errors.push('Не удалось очистить фото неимпортированной записи: ' + cleanupError.message);
              }
            }
            errors.push(error.message);
          }
        }
        await loadProfiles();
        await updateStorageInfo();
        const summary = `Импортировано профилей: ${imported} из ${profiles.length}.`;
        setSyncStatus(errors.length ? `${summary} Ошибок: ${errors.length}.` : summary, errors.length > 0);
        alert([summary, ...errors.slice(0, 3)].join('\n'));
      } catch (error) {
        alert('Не удалось импортировать резервную копию: ' + error.message);
      }
    }

    async function updateStorageInfo() {
      try {
        if (!db) return;
        const count = await db.countProfiles();
        const activeProfiles = await db.getAllProfiles();
        const archivedProfiles = await db.getArchivedProfiles();
        const allData = [...activeProfiles, ...archivedProfiles];
        let totalSize = 0;
        allData.forEach(p => {
          totalSize += JSON.stringify(p).length;
        });
        const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
        const remaining = CONFIG.MAX_PROFILES - count;
        const percentage = ((count / CONFIG.MAX_PROFILES) * 100).toFixed(1);
        document.getElementById('profilesCreated').innerText = count;
        document.getElementById('profilesRemaining').innerText = remaining;
        document.getElementById('percentageUsed').innerText = percentage + '%';
        document.getElementById('storageUsed').innerText = totalSizeMB + ' MB';
        document.getElementById('storageFill').style.width = percentage + '%';
        document.getElementById('totalProfiles').textContent = count;
        document.getElementById('dbSize').textContent = totalSizeMB + ' MB';
        if (percentage > 90) {
          document.getElementById('storageFill').classList.add('warning');
        } else {
          document.getElementById('storageFill').classList.remove('warning');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        setSyncStatus('Ошибка обновления данных: ' + error.message, true);
      }
    }

    function filterProfiles() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      document.querySelectorAll('.profile-item').forEach(item => {
        const name = item.querySelector('.profile-item-name').innerText.toLowerCase();
        item.style.display = name.includes(search) ? 'block' : 'none';
      });
    }

    function calculateTotal() {
      const orderSumEl = document.getElementById("orderSum");
      const bonusesEl = document.getElementById("bonuses");
      const finesEl = document.getElementById("fines");
      if (!orderSumEl || !bonusesEl || !finesEl) return;
      const orderSum = extractNumber(orderSumEl.innerText);
      const bonuses = extractNumber(bonusesEl.innerText);
      const fines = extractNumber(finesEl.innerText);
      const total = orderSum + bonuses + fines;
      const totalPriceEl = document.getElementById("totalPrice");
      if (totalPriceEl) {
        totalPriceEl.innerText = formatCurrency(total);
      }
    }

    function showModal(modalId) {
      document.getElementById(modalId).classList.add('show');
    }

    function closeModal(modalId) {
      document.getElementById(modalId).classList.remove('show');
    }


    // ===== VISIBILITÉ APRÈS AUTHENTIFICATION + AFFICHAGE A4 =====
    function setA4UIReady(ready) {
      const isReady = !!ready &&
                      !!authState.isLoggedIn &&
                      !!document.getElementById('page');

      document.body.classList.toggle('a4-ui-ready', isReady);

      if (!isReady) {
        const shortcuts = document.getElementById('shortcutsOverlay');
        if (shortcuts) shortcuts.classList.remove('show');
        setMobilePanelState(false, false);
      }
    }

    function isA4UIReady() {
      return authState.isLoggedIn && !!document.getElementById('page');
    }

    // ===== PANNEAUX MOBILES : TIROIRS GAUCHE / DROITE =====
    function isMobileLayout() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    function setMobilePanelState(leftOpen, rightOpen) {
      const leftPanel = document.getElementById('mobileLeftPanel');
      const mainContent = document.getElementById('mobileMainContent');
      const leftToggle = document.getElementById('mobileLeftToggle');
      const rightToggle = document.getElementById('mobileRightToggle');

      if (!leftPanel || !mainContent) return;

      const finalLeft = !!leftOpen && isMobileLayout();
      const finalRight = !!rightOpen && isMobileLayout();

      leftPanel.classList.toggle('mobile-drawer-open', finalLeft);
      mainContent.classList.toggle('mobile-right-open', finalRight);

      document.body.classList.toggle('mobile-panels-open', finalLeft || finalRight);

      if (leftToggle) {
        leftToggle.setAttribute('aria-expanded', String(finalLeft));
      }
      if (rightToggle) {
        rightToggle.setAttribute('aria-expanded', String(finalRight));
      }
    }

    function toggleMobilePanel(side) {
      if (!isA4UIReady()) return;
      if (!isMobileLayout()) return;

      const leftPanel = document.getElementById('mobileLeftPanel');
      const mainContent = document.getElementById('mobileMainContent');

      if (side === 'left') {
        const open = !leftPanel.classList.contains('mobile-drawer-open');
        setMobilePanelState(open, false);
      } else if (side === 'right') {
        const open = !mainContent.classList.contains('mobile-right-open');
        setMobilePanelState(false, open);
      }
    }

    function closeMobilePanels() {
      setMobilePanelState(false, false);
    }

    // Fermer avec Échap et remettre automatiquement le mode ordinateur
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeMobilePanels();
        if (document.getElementById('adminSettingsPanel').classList.contains('show')) {
          toggleAdminSettings();
        }
      }
    });

    window.addEventListener('resize', function() {
      fitA4ToViewport();
      if (!isMobileLayout()) {
        closeMobilePanels();
      }
    });

    window.addEventListener('beforeprint', function() {
      document.querySelectorAll('.a4-wrapper').forEach(wrapper => {
        wrapper.style.width = '210mm';
        wrapper.style.height = 'auto';
        const page = wrapper.querySelector('.a4');
        if (page) page.style.transform = 'none';
      });
    });

    window.addEventListener('afterprint', fitA4ToViewport);

    // СОЧЕТАНИЯ КЛАВИШ
    document.addEventListener('keydown', function(event) {
      if (!isA4UIReady()) return;
      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        printWithName();
      }
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        saveProfile();
      }
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        createNewProfile();
      }
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        openBatchExport();
      }
      if (event.ctrlKey && event.key === 'o') {
        event.preventDefault();
        toggleAdminSettings();
      }
    });


    // Initialisation mobile : panneaux fermés, A4 immédiatement disponible.
    document.addEventListener('DOMContentLoaded', function() {
      closeMobilePanels();

      // Empêche le zoom involontaire sur les boutons de tiroir sur certains mobiles.
      document.querySelectorAll('.mobile-panel-toggle, .mobile-drawer-close').forEach(btn => {
        btn.addEventListener('touchstart', function() {}, { passive: true });
      });
    });

    window.addEventListener('load', function() {
      const urlParams = new URLSearchParams(window.location.search);
      changeLanguage(currentLanguage);
      initializeSupabaseAuth();
    });

    console.log('✅ Приложение запущено');
