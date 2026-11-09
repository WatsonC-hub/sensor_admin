// A signed-out visitor presses "Log ind" (SignedOut) and is sent to calypso-auth's login page, which
// sends a visitor who is already signed in straight back. If this app then still gets no user
// (python_api refuses the login, cannot reach calypso-auth, or never receives the cookie), the two would
// send the visitor back and forth. The time of the last redirect is kept for the browser session, and a
// visitor who is back within the window gets a message instead (SignInProblem).
const KEY = 'calypso-auth-login-redirect-at';

export const LOGIN_LOOP_WINDOW_MS = 15_000;

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * True when the visitor may be sent to the login page now (the time is remembered). False when they
 * were sent less than the window ago and are back without a user: the login did not help, so sending
 * them again would only loop.
 */
export function mayRedirectToLogin(store: Store | null, now: number = Date.now()): boolean {
  try {
    const last = Number(store?.getItem(KEY));
    if (last > 0 && now - last < LOGIN_LOOP_WINDOW_MS) return false;
    store?.setItem(KEY, String(now));
  } catch {
    // no storage (a private window): the guard cannot work, so the redirect goes ahead as before
  }
  return true;
}

/**
 * True when the visitor was sent to the login page less than the window ago (nothing is written). A
 * visitor who is back without a user then gets SignInProblem instead of the "Log ind" screen.
 */
export function wasJustSentToLogin(store: Store | null, now: number = Date.now()): boolean {
  try {
    const last = Number(store?.getItem(KEY));
    return last > 0 && now - last < LOGIN_LOOP_WINDOW_MS;
  } catch {
    return false;
  }
}

/** Called when a user is signed in: the login worked, so a later sign-out may redirect at once. */
export function forgetLoginRedirect(store: Store | null) {
  try {
    store?.removeItem(KEY);
  } catch {
    // no storage
  }
}
