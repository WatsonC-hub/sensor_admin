import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {clientsClaim} from 'workbox-core';
import {ExpirationPlugin} from 'workbox-expiration';
import {cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute} from 'workbox-precaching';
import {NavigationRoute, registerRoute} from 'workbox-routing';
import {CacheFirst, NetworkFirst} from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    allowlist: [/^\/$/],
  })
);

registerRoute(
  /\/api\/(?!data).*/,
  new NetworkFirst({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24,
      }),
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
  'GET'
);

registerRoute(
  /workbox-window/,
  new CacheFirst({
    cacheName: 'manual',
  }),
  'GET'
);

// receive web push notifications
self.addEventListener('push', receivePushNotification);

function receivePushNotification(event) {
  console.log('[Service Worker] Push Received.');
  const promise = isClientFocused().then((focused) => {
    // if (focused) {
    //   // browser is focused, do something
    //   console.log('browser is focused, do something');
    //   return;
    // }

    const data = JSON.parse(event.data.text());

    console.log('[Service Worker] Push had this data: ', data);

    const options = {
      icon: 'calypso_logo.png',
      tag: 'notification-tag',
      renotify: true,
      ...data,
    };

    return self.registration.showNotification(options.title, options);
  });
  event.waitUntil(promise);
}

self.addEventListener('notificationclick', onNotificationClick);

function onNotificationClick(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  const maxVisibleActions = window.Notification?.maxActions;

  if (maxVisibleActions) {
    if (event.action === 'close') {
      return;
    }

    if (event.action === 'open') {
      return event.waitUntil(openURL(event.notification.data.url));
    }

    if (event.action === 'ignore') {
      return alert('You clicked the "Ignore" button.');
    }
  } else {
    return event.waitUntil(openURL(event.notification.data.url));
  }
}

function isClientFocused() {
  return self.clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => Promise.resolve(windowClients.some((client) => client.focused)));
}

function findBestClient(clients) {
  const focused = clients.find((client) => client.focused);
  const visible = clients.find((client) => client.visibilityState === 'visible');
  return focused || visible || clients[0];
}

async function openURL(url) {
  const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
  const bestClient = findBestClient(clients);
  await bestClient.navigate(url);
  await bestClient.focus();
}

// handle notification click
