// Le script worker reste à la racine pour pouvoir contrôler toutes les pages du site.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../service-worker.js')
      .then((registration) => {
        console.log('Service Worker enregistré avec succès ! Portée :', registration.scope);

        let updateReloadScheduled = false;
        const activateUpdate = (worker) => {
          if (updateReloadScheduled || !navigator.serviceWorker.controller) return;
          updateReloadScheduled = true;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          }, { once: true });
          worker.postMessage({ type: 'SKIP_WAITING' });
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

      })
      .catch((error) => {
        console.warn('L\'enregistrement du Service Worker a échoué :', error);
      });
  });
}
