let registeredServiceWorker;
const applicationServerPublicKey = 'BM50woqSXNQ0UJSrnJo0admuKr6mbpj4HUantAK8qo0Ya1aEcKjOFO5xO63MF7oERFysLT8UHaWNF8EnYIYK7lE';
const notificationBtn = document.querySelector('.push-notification__button');
const notificationOutput = document.querySelector('.push-notification__output');

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js', {
    scope: '/showroom/builds/',
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

  console.log('Either Service Worker or Push is not supported so a Service Worker has not been registered.');
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
      console.log('User is NOT subscribed, ask the user to subscribe.');
      notificationBtn.textContent = 'Get notifications';
      notificationBtn.disabled = false;
      notificationBtn.classList.remove('btn--disabled');
      notificationBtn.addEventListener('click', subscribeUser);
    }
    else {
      console.log('User is already subscribed');
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

    console.log('User is subscribed');
  }).catch(err => {
    notificationBtn.disabled = false;
    notificationBtn.classList.remove('btn--disabled');
    notificationBtn.textContent = 'Looks like something went wrong. Please try again.';
    console.log("Could not subscribe the user to notifications: ", err);
  });
}

function updateSubscriptionOnServer(subscription) {
  notificationOutput.textContent = JSON.stringify(subscription);
  //send our subscription to a backend
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
