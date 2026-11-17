if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistration()
      .then(registration => {
        if (registration) return registration.update();
      })
      .catch(error => {
        console.warn('La vérification initiale des mises à jour a échoué :', error);
      });
  });
}
