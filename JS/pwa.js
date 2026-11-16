(function() {
  const buttons = Array.from(document.querySelectorAll('.pwa-install-button'));
  if (!buttons.length || !window.isSecureContext) return;

  let deferredPrompt = null;
  const userAgent = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMacSafari = /macintosh/i.test(userAgent)
    && /safari/i.test(userAgent)
    && !/(chrome|chromium|crios|edg|fxios)/i.test(userAgent);

  function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  }

  function setVisible(visible) {
    buttons.forEach(button => {
      button.hidden = !visible;
      const item = button.closest('.pwa-install-item');
      if (item) item.hidden = !visible;
    });
  }

  function translated(text) {
    return window.AppI18n ? window.AppI18n.t(text) : text;
  }

  async function install() {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      try {
        await promptEvent.prompt();
        await promptEvent.userChoice;
        setVisible(false);
      } catch (error) {
        console.error('Could not open the PWA installation prompt.', error);
        window.alert(translated('Installation impossible pour le moment. Utilisez le menu du navigateur pour installer l’application.'));
        setVisible(false);
      }
      return;
    }

    if (isIOS) {
      window.alert(translated('Pour installer l’application sur iPhone ou iPad, ouvrez cette page dans Safari, touchez Partager, puis Sur l’écran d’accueil.'));
    } else if (isMacSafari) {
      window.alert(translated('Dans Safari sur Mac, ouvrez le menu Fichier puis choisissez Ajouter au Dock.'));
    }
  }

  if (isInstalled()) return;

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    setVisible(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setVisible(false);
  });

  buttons.forEach(button => button.addEventListener('click', install));

  if (isIOS || isMacSafari) setVisible(true);
})();
