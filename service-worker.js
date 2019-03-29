self.addEventListener('install', event => {
  console.log("Installing Service Worker...");
});

self.addEventListener('activate', function(event) {
  console.log("Service Worker has been activated.");
});

self.addEventListener('push', function(event) {
  console.log('Push received');
  event.waitUntil(self.registration.showNotification('This is the notification title', {
    //the response may be a string or json object so body could be "event.data.json()" or "event.data.text()"
    body: event.data.text(),
    icon: 'images/logo.png',
    badge: 'images/logo.png',
  }));
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification has been clicked');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://google.com')
  );
});
