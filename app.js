let registeredServiceWorker;
const applicationServerPublicKey = 'BM50woqSXNQ0UJSrnJo0admuKr6mbpj4HUantAK8qo0Ya1aEcKjOFO5xO63MF7oERFysLT8UHaWNF8EnYIYK7lE';
const notificationBtn = document.querySelector('.push-notification__button');
const notificationOutput = document.querySelector('.push-notification__output');

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js', {
    scope: '/',
  }).then(function(registration) {
    console.log('Service Worker installed and activated: ', registration);
    registeredServiceWorker = registration;
    notificationBtn.textContent = 'Checking if already subscribed...';
    decideIfUserSubscribed();
  }).catch(function(error) {
    console.log('Service worker installation failed, error: ', error);
  });
}
else {
  notificationBtn.textContent = 'Notifications are not supported.';
}

function decideIfUserSubscribed() {
  if (Notification.permission === 'denied') {
    notificationBtn.textContent = 'Push Messaging Blocked.';
    notificationBtn.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  registeredServiceWorker.pushManager.getSubscription().then(subscription => {
    updateSubscriptionOnServer(subscription);
    if(subscription === null) {
      notificationBtn.textContent = 'Get notifications';
      notificationBtn.disabled = false;
      notificationBtn.classList.remove('btn--disabled');
      notificationBtn.addEventListener('click', subscribeUser);
    }
    else {
      notificationBtn.textContent = 'User is already subscribed';
    }
  });
}

function subscribeUser() {
  notificationBtn.disabled = true;
  notificationBtn.classList.add('btn--disabled');
  notificationBtn.textContent = 'Subscribing...';

  registeredServiceWorker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(applicationServerPublicKey),
  }).then(function(subscription){
    updateSubscriptionOnServer(subscription);

    notificationBtn.textContent = 'You\'re subscribed!';
    notificationBtn.removeEventListener('click', subscribeUser);
  }).catch(err => {
    notificationBtn.disabled = false;
    notificationBtn.classList.remove('btn--disabled');
    notificationBtn.textContent = 'Looks like something went wrong. Please try again.';
  });
}

function updateSubscriptionOnServer(subscription) {
  const jsonSubscription = JSON.stringify(subscription);
  const requestBody = JSON.parse(jsonSubscription);
  //store subscription information
  fetch('url-to-post-to.com', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    //post successful, do something
  }).catch(err => {
    Error(err);
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace('-', '+').replace('_', '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
