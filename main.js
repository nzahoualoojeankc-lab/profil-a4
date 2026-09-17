// Enregistrement du Service Worker pour activer la PWA (Mode hors ligne + Installation)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès ! Portée :', registration.scope);
      })
      .catch((error) => {
        console.warn('L\'enregistrement du Service Worker a échoué :', error);
      });
  });
}
