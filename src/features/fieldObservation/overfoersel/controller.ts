import {isAxiosError} from 'axios';

import {ping} from '~/features/fieldObservation/overfoersel/api';
import {runOverfoersel} from '~/features/fieldObservation/overfoersel/engine';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {OverfoerselMode} from '~/features/fieldObservation/types';

/** After this many failed runs in a row, Auto pauses. */
const FAILURES_BEFORE_PAUSE = 2;
/** Wait after a local change before Auto runs, so a burst of edits goes in one run. */
const CHANGE_DEBOUNCE_MS = 2_000;
const INTERVAL_MS = 60_000;
/** While paused, a ping faster than this counts as a good connection. */
const GOOD_PING_MS = 2_000;
const GOOD_PINGS_TO_RESUME = 2;

export type OverfoerselState = {
  mode: OverfoerselMode;
  running: boolean;
  /** Auto has paused itself because of a poor connection. */
  paused: boolean;
  failures: number;
  lastError: string | null;
  lastSuccessAt: string | null;
};

const describeError = (error: unknown) => {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
      return 'Forbindelsen er for langsom';
    if (!error.response) return 'Ingen forbindelse';
    if (error.response.status === 401) return 'Du er ikke logget ind';
    return `Serverfejl (${error.response.status})`;
  }
  return error instanceof Error ? error.message : 'Ukendt fejl';
};

/**
 * Decides when overførsel runs. It never looks at navigator.onLine, which says
 * "online" on a connection that is too slow to use. Timeouts and pings decide instead.
 */
export class OverfoerselController {
  private state: OverfoerselState = {
    mode: 'auto',
    running: false,
    paused: false,
    failures: 0,
    lastError: null,
    lastSuccessAt: null,
  };
  private listeners = new Set<() => void>();
  private interval: ReturnType<typeof setInterval> | undefined;
  private debounce: ReturnType<typeof setTimeout> | undefined;
  private goodPings = 0;
  private started = false;
  private startToken = 0;
  /**
   * Requests to fetch projekter and observationstyper on the next run, past the hourly limit:
   * one when the app opens and one per Overfør. A run that succeeds settles the requests it saw,
   * so a press during a run still gets its own refresh.
   */
  private referenceDataRequests = 0;

  constructor(private readonly db: FieldObservationDb) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  private set(patch: Partial<OverfoerselState>) {
    this.state = {...this.state, ...patch};
    this.listeners.forEach((listener) => listener());
  }

  async start() {
    if (this.started) return;
    this.started = true;
    // A stop() during the await below invalidates this token, so a stale start
    // never creates an interval that nobody will clear.
    const token = ++this.startToken;
    this.referenceDataRequests += 1;
    const mode = (await this.db.meta.get('mode'))?.value;
    if (token !== this.startToken) return;
    if (mode === 'auto' || mode === 'manual') this.set({mode});
    clearInterval(this.interval);
    this.interval = setInterval(() => void this.tick(), INTERVAL_MS);
    if (this.state.mode === 'auto') void this.run();
  }

  stop() {
    this.started = false;
    this.startToken += 1;
    clearInterval(this.interval);
    this.interval = undefined;
    clearTimeout(this.debounce);
  }

  /** Call when local data changed. */
  notifyChange() {
    if (this.state.mode !== 'auto' || this.state.paused) return;
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => void this.run(), CHANGE_DEBOUNCE_MS);
  }

  /** The Overfør button: always tries once, and a success brings Auto back. */
  syncNow = async () => {
    // A press on Overfør also retries rows the server rejected earlier. Auto doesn't,
    // so it never keeps sending a row the server will keep refusing.
    await this.db.transaction('rw', this.db.observations, this.db.images, async () => {
      await this.db.observations.where('dirty').equals(-1).modify({dirty: 1, sync_error: null});
      await this.db.images.where('dirty').equals(-1).modify({dirty: 1, sync_error: null});
    });
    this.referenceDataRequests += 1;
    await this.run();
  };

  async setMode(mode: OverfoerselMode) {
    await this.db.meta.put({key: 'mode', value: mode});
    this.set({mode, paused: false, failures: 0});
    if (mode === 'auto') void this.run();
  }

  private async tick() {
    if (this.state.mode !== 'auto') return;
    if (!this.state.paused) {
      await this.run();
      return;
    }
    const roundTrip = await ping();
    this.goodPings = roundTrip !== null && roundTrip < GOOD_PING_MS ? this.goodPings + 1 : 0;
    if (this.goodPings >= GOOD_PINGS_TO_RESUME) {
      this.goodPings = 0;
      this.set({paused: false, failures: 0});
      await this.run();
    }
  }

  private async run() {
    if (this.state.running) return;
    this.set({running: true});
    try {
      const requests = this.referenceDataRequests;
      await runOverfoersel(this.db, {refreshReferenceData: requests > 0});
      this.referenceDataRequests -= requests;
      this.goodPings = 0;
      this.set({
        running: false,
        paused: false,
        failures: 0,
        lastError: null,
        lastSuccessAt: new Date().toISOString(),
      });
    } catch (error) {
      const failures = this.state.failures + 1;
      this.set({
        running: false,
        failures,
        lastError: describeError(error),
        paused: this.state.mode === 'auto' && failures >= FAILURES_BEFORE_PAUSE,
      });
    }
  }
}
