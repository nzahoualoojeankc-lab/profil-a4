// Enregistrement du Service Worker pour activer la PWA (Mode hors ligne + Installation)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès ! Portée :', registration.scope);

        // Détecte si une mise à jour du code est trouvée sur GitHub
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // Dès que le nouveau Service Worker est entièrement téléchargé et prêt
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nouvelle version détectée ! Application des modifications de GitHub...');
                // Recharge automatiquement la page de l'utilisateur pour appliquer la mise à jour
                window.location.reload();
              }
            });
          }
        });

      })
      .catch((error) => {
        console.warn('L\'enregistrement du Service Worker a échoué :', error);
      });
  });
}
