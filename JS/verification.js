(function() {
  let client = null;
  let userId = null;
  let cameraStream = null;
  let cameraFrame = null;
  let detecting = false;
  let verificationSchemaMissing = false;
  const scanCanvas = document.createElement('canvas');
  const scanContext = scanCanvas.getContext('2d', { willReadFrequently: true });

  function t(text) {
    return window.AppI18n ? window.AppI18n.t(text) : text;
  }

  function setFeedback(id, message, isError) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = message || '';
    element.classList.toggle('error', !!isError);
  }

  function verificationUrl(serialNumber) {
    const url = new URL('app.html', window.location.href);
    url.searchParams.set('verify', serialNumber);
    return url.href;
  }

  function qrDataUrl(serialNumber) {
    if (typeof window.qrcode !== 'function') {
      throw new Error(t('Le générateur QR local n’a pas pu être chargé.'));
    }
    const code = window.qrcode(0, 'M');
    code.addData(verificationUrl(serialNumber));
    code.make();
    return code.createDataURL(5, 4);
  }

  function verificationError(error) {
    if (['42P01', '42883', 'PGRST202', 'PGRST205'].includes(error.code)) {
      return `${t('La vérification nécessite l’application de la migration Supabase dédiée.')} (${error.code})`;
    }
    return error.message || t('Résultat de vérification indisponible.');
  }

  function showGeneratedResult(row) {
    const result = document.getElementById('verificationGeneratedResult');
    document.getElementById('verificationGeneratedSerial').value = row.serial_number;
    const image = document.getElementById('verificationGeneratedQr');
    image.removeAttribute('src');
    result.hidden = false;
    image.src = qrDataUrl(row.serial_number);
  }

  function selectedSettings() {
    const validUntil = document.getElementById('verificationValidUntil').value || null;
    const placement = document.getElementById('verificationPlacement').value;
    if (validUntil && validUntil < new Date().toISOString().slice(0, 10)) {
      throw new Error(t('La date de validité ne peut pas être antérieure à aujourd’hui.'));
    }
    if (!['header', 'footer', 'none'].includes(placement)) {
      throw new Error(t('Choisissez un emplacement d’affichage valide.'));
    }
    return { validUntil, placement };
  }

  async function generate(sourceType, sourceId) {
    if (!client || !userId) throw new Error(t('Connectez-vous pour générer un numéro de série.'));
    if (!sourceId) throw new Error(t('Enregistrez d’abord la fiche ou le document.'));
    document.getElementById('verificationGeneratedResult').hidden = true;
    setFeedback('verificationGenerateFeedback', '', false);
    window.dispatchEvent(new CustomEvent('profile-verification-generation-started'));
    const settings = selectedSettings();
    const { data, error } = await client.rpc('profili_a4_create_profile_verification', {
      p_source_type: sourceType,
      p_source_id: String(sourceId),
      p_valid_until: settings.validUntil,
      p_placement: settings.placement
    });
    if (error) throw new Error(verificationError(error));
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.serial_number) {
      throw new Error(t('Le serveur n’a pas retourné le numéro de série créé.'));
    }
    showGeneratedResult(row);
    setFeedback('verificationGenerateFeedback', t('Numéro et QR code créés. Le code précédent de cette fiche est remplacé.'), false);
    window.dispatchEvent(new CustomEvent('profile-verification-updated', {
      detail: { sourceType, sourceId: String(sourceId) }
    }));
    return row;
  }

  async function getForSource(sourceType, sourceId) {
    if (!client || !userId || !sourceId) return null;
    const { data, error } = await client.from('profile_verifications')
      .select('serial_number,source_type,source_id,source_category,source_title,event_name,valid_until,placement,status,created_at')
      .eq('owner_id', userId)
      .eq('source_type', sourceType)
      .eq('source_id', String(sourceId))
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function attachToSheet(sheet, sourceType, sourceId) {
    if (!sheet || !sourceId) return;
    sheet.querySelectorAll('.profile-verification-mark').forEach(mark => mark.remove());
    let verification;
    try {
      verification = await getForSource(sourceType, sourceId);
    } catch (error) {
      if (!['42P01', 'PGRST205'].includes(error.code)) throw error;
      if (!verificationSchemaMissing) {
        setFeedback('verificationGenerateFeedback', t('La vérification nécessite l’application de la migration Supabase dédiée.'), true);
        verificationSchemaMissing = true;
      }
      return;
    }
    verificationSchemaMissing = false;
    if (!verification || verification.status !== 'active' || verification.placement === 'none') return;

    const mark = document.createElement('div');
    mark.className = `profile-verification-mark ${verification.placement}`;
    const image = document.createElement('img');
    image.alt = t('QR code de vérification');
    image.src = qrDataUrl(verification.serial_number);
    const serial = document.createElement('span');
    serial.textContent = verification.serial_number;
    mark.append(image, serial);
    if (verification.placement === 'header') sheet.prepend(mark);
    else sheet.append(mark);
  }

  function setResultText(result, value) {
    result.replaceChildren();
    const heading = document.createElement('strong');
    const statusLabels = {
      valid: t('Profil authentique et valide.'),
      expired: t('Le profil a été authentique, mais sa période de validité est expirée.'),
      revoked: t('Ce numéro de série a été révoqué.'),
      unknown: t('Aucun profil correspondant à ce numéro n’a été trouvé.')
    };
    heading.textContent = statusLabels[value.status] || t('Résultat de vérification indisponible.');
    result.appendChild(heading);

    if (!value.found) return;
    if (value.valid_until) {
      const expiration = document.createElement('p');
      expiration.textContent = `${t('Valide jusqu’au :')} ${value.valid_until}`;
      result.appendChild(expiration);
    } else {
      const expiration = document.createElement('p');
      expiration.textContent = t('Aucune date d’expiration définie.');
      result.appendChild(expiration);
    }

    if (value.details) {
      const details = document.createElement('dl');
      const sourceType = value.details.source_type === 'profile'
        ? t('Fiche classique')
        : t('Document personnalisé');
      const categoryLabels = {
        payroll_report: 'Rapport de paie',
        payroll_check: 'Chèque de paie',
        event_badge: 'Badge du personnel',
        event_ticket: 'Billet d’événement'
      };
      const entries = [
        [t('Créateur'), value.details.creator],
        [t('Origine'), sourceType],
        [t('Type de profil'), t(categoryLabels[value.details.category] || value.details.category)],
        [t('Titre'), value.details.title],
        [t('Événement'), value.details.event_name],
        [t('Créé le'), value.details.created_at]
      ];
      entries.forEach(([label, detail]) => {
        if (!detail) return;
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = detail;
        details.append(term, description);
      });
      result.appendChild(details);
    }
    result.hidden = false;
  }

  async function verifySerial(serialNumber) {
    if (!client || !userId) {
      setFeedback('verificationScanFeedback', t('Connectez-vous pour vérifier un profil.'), true);
      return;
    }
    const result = document.getElementById('verificationResult');
    result.hidden = true;
    result.replaceChildren();
    const serial = (serialNumber || document.getElementById('verificationSerialInput').value).trim();
    if (!serial) {
      setFeedback('verificationScanFeedback', t('Saisissez ou scannez un numéro de série.'), true);
      return;
    }
    document.getElementById('verificationSerialInput').value = serial;
    try {
      const { data, error } = await client.rpc('profili_a4_verify_profile', {
        p_serial_number: serial
      });
      if (error) throw error;
      if (!data || typeof data !== 'object') {
        throw new Error(t('Le serveur a retourné un résultat de vérification invalide.'));
      }
      setResultText(result, data);
      result.hidden = false;
      setFeedback('verificationScanFeedback', '', false);
    } catch (error) {
      setFeedback('verificationScanFeedback', verificationError(error), true);
    }
  }

  function serialFromScan(value) {
    try {
      const url = new URL(value);
      const serial = url.searchParams.get('verify');
      if (serial) return serial;
    } catch {
      // Scanners may return the raw serial instead of a URL.
    }
    const match = String(value).match(/PA4-[0-9a-f]{32}/i);
    return match ? match[0] : '';
  }

  function stopCamera() {
    detecting = false;
    if (cameraFrame !== null) clearTimeout(cameraFrame);
    cameraFrame = null;
    if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    const video = document.getElementById('verificationCamera');
    video.pause();
    video.srcObject = null;
    video.hidden = true;
    document.querySelector('[data-handler-click="h108"]').hidden = true;
    document.querySelector('[data-handler-click="h107"]').hidden = false;
  }

  function decodeQr(image) {
    if (typeof window.jsQR !== 'function') {
      throw new Error(t('Le lecteur QR local n’a pas pu être chargé.'));
    }
    const width = image.videoWidth || image.naturalWidth || image.width;
    const height = image.videoHeight || image.naturalHeight || image.height;
    if (!width || !height) return null;
    const scale = Math.min(1, 960 / width);
    const sampleWidth = Math.round(width * scale);
    const sampleHeight = Math.round(height * scale);
    if (!scanContext) throw new Error(t('La lecture de l’image QR est indisponible.'));
    scanCanvas.width = sampleWidth;
    scanCanvas.height = sampleHeight;
    scanContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    return window.jsQR(scanContext.getImageData(0, 0, sampleWidth, sampleHeight).data, sampleWidth, sampleHeight);
  }

  async function scanVideo(video) {
    if (!detecting) return;
    try {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const code = decodeQr(video);
        if (code) {
          const serial = serialFromScan(code.data);
          if (!serial) throw new Error(t('Le QR code ne contient pas de numéro Profili A4.'));
          stopCamera();
          await verifySerial(serial);
          return;
        }
      }
    } catch (error) {
      stopCamera();
      setFeedback('verificationScanFeedback', error.message, true);
      return;
    }
    cameraFrame = window.setTimeout(() => scanVideo(video), 300);
  }

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFeedback('verificationScanFeedback', t('L’accès caméra nécessite une page HTTPS et l’autorisation du navigateur.'), true);
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.getElementById('verificationCamera');
      video.srcObject = cameraStream;
      video.hidden = false;
      await video.play();
      detecting = true;
      document.querySelector('[data-handler-click="h108"]').hidden = false;
      document.querySelector('[data-handler-click="h107"]').hidden = true;
      setFeedback('verificationScanFeedback', t('Caméra active. Présentez le QR code devant l’objectif.'), false);
      scanVideo(video);
    } catch (error) {
      stopCamera();
      setFeedback('verificationScanFeedback', error.message, true);
    }
  }

  async function scanImage(file) {
    if (!file) return;
    let objectUrl = null;
    try {
      const image = new Image();
      objectUrl = URL.createObjectURL(file);
      image.src = objectUrl;
      if (typeof image.decode === 'function') await image.decode();
      else await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(t('Impossible de lire l’image QR sélectionnée.')));
      });
      const code = decodeQr(image);
      if (!code) throw new Error(t('Aucun QR code n’a été détecté dans cette image.'));
      const serial = serialFromScan(code.data);
      if (!serial) throw new Error(t('Le QR code ne contient pas de numéro Profili A4.'));
      await verifySerial(serial);
    } catch (error) {
      setFeedback('verificationScanFeedback', error.message, true);
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  function openVerifier(serial) {
    stopCamera();
    document.getElementById('verificationPage').hidden = false;
    document.getElementById('verificationResult').hidden = true;
    setFeedback('verificationScanFeedback', '', false);
    if (serial) {
      document.getElementById('verificationSerialInput').value = serial;
      verifySerial(serial);
    }
  }

  function closeVerifier() {
    stopCamera();
    document.getElementById('verificationPage').hidden = true;
  }

  function initialize(supabaseClient, accountId) {
    client = supabaseClient;
    userId = accountId;
    verificationSchemaMissing = false;
  }

  function reset() {
    stopCamera();
    client = null;
    userId = null;
    verificationSchemaMissing = false;
    closeVerifier();
    document.getElementById('verificationGeneratedResult').hidden = true;
    document.getElementById('verificationGeneratedSerial').value = '';
    document.getElementById('verificationGeneratedQr').removeAttribute('src');
    setFeedback('verificationGenerateFeedback', '', false);
    setFeedback('verificationScanFeedback', '', false);
  }

  window.AppVerification = {
    initialize,
    reset,
    generate,
    getForSource,
    attachToSheet,
    openVerifier,
    closeVerifier,
    verifySerial,
    startCamera,
    stopCamera,
    scanImage
  };
})();
