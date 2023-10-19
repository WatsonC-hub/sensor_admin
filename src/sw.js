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

    const options = {
      body: event.data.text(),
      icon: 'calypso_logo.png',
      tag: 'notification-tag',
      renotify: true,
    };

    return self.registration.showNotification(event.data.text(), options);
  });
  event.waitUntil(promise);
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
