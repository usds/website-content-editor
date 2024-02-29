if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    if (registration.installing) {
      console.log("Service worker installing");
    } else if (registration.waiting) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active");
    }
    } catch(err) {
      console.error(`Registration failed with ${err}`, err);
    }
  })
}


