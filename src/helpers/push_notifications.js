import {apiClient} from '~/apiClient';

export async function askPermission() {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      console.log('User Choice', result);
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  });
}

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export function subscribeUserToPush() {
  return navigator.serviceWorker
    .getRegistration()
    .then(function (registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BJIYweKugk_NRomsAcGKFWoUwKSJgv1jtwIlGZ4Uki9IJMgm05N4g4VQNo47qF9Wu2pTdlrHgxMznarEr2w5Cxo'
        ),
      };

      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(function (pushSubscription) {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      sendSubscriptionToBackEnd(pushSubscription);
      return pushSubscription;
    });
}

export async function sendSubscriptionToBackEnd(subscription) {
  const response = await apiClient.post('/notifications/subscribe', {
    subscription: JSON.stringify(subscription),
  });
  return response.data;
}

export async function unsubscribeUserFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    await apiClient.post('/notifications/unsubscribe', {
      subscription: JSON.stringify(subscription),
    });
  }
}

export async function testNotification() {
  const response = await apiClient.post('/notifications/send-test');
  return response.data;
}
