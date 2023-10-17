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
