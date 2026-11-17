// Le script worker reste à la racine pour pouvoir contrôler toutes les pages du site.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../service-worker.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('Service Worker enregistré avec succès ! Portée :', registration.scope);

        let updateReloadScheduled = false;
        let updateCheckInProgress = false;
        const activateUpdate = (worker) => {
          if (updateReloadScheduled || !navigator.serviceWorker.controller) return;
          updateReloadScheduled = true;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          }, { once: true });
          worker.postMessage({ type: 'SKIP_WAITING' });
        };

        const checkForUpdates = () => {
          if (updateCheckInProgress || !navigator.onLine) return;
          updateCheckInProgress = true;
          registration.update()
            .catch((error) => {
              console.warn('La vérification des mises à jour a échoué :', error);
            })
            .finally(() => {
              updateCheckInProgress = false;
            });
        };

        if (registration.waiting) activateUpdate(registration.waiting);

        // Détecte les mises à jour et active le nouveau worker même si d'autres onglets sont ouverts.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nouvelle version détectée ! Application des modifications de GitHub...');
                activateUpdate(newWorker);
              }
            });
          }
        });

        checkForUpdates();
        window.addEventListener('focus', checkForUpdates);
        window.addEventListener('online', checkForUpdates);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdates();
        });
        window.setInterval(checkForUpdates, 5 * 60 * 1000);

      })
      .catch((error) => {
        console.warn('L\'enregistrement du Service Worker a échoué :', error);
      });
  });
}
