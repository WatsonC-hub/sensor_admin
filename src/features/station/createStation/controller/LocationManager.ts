import {wireChildToParent} from '../helper/wireChildToParent';
import {AggregateController} from './AggregateController';
import {LocationAggregate} from './LocationAggregate';
import {LocationData, RootPayload} from './types';

type Listener = () => void;

export class LocationManager {
  private parent: AggregateController<RootPayload>;
  private agg?: LocationAggregate;
  private unsubscribe?: () => void;

  private listeners = new Set<Listener>();

  private defaultState: LocationData = {};

  constructor(parent: AggregateController<RootPayload>, defaultState: LocationData = {}) {
    this.parent = parent;
    this.agg = this.getOrCreate(defaultState);

    // Register parent slice
    this.parent.registerSlice('location', true, async () => {
      return await this.validate();
    });

    this.updateParentSlice();
    this.emit();
  }

  /** Subscribe to changes (aggregate created/removed) */
  onChange(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  /** Create or return existing location aggregate */
  getOrCreate(defaultState: LocationData = this.defaultState) {
    if (this.agg) return this.agg;

    const agg = new LocationAggregate(defaultState);

    this.unsubscribe = wireChildToParent(
      {
        snapshot: () => agg.snapshot(),
        controller: agg.getController(),
      },
      this.parent,
      'location'
    );

    return agg;
  }

  /** Get aggregate without creating */
  get() {
    return this.agg;
  }

  /** Validate location */
  private async validate() {
    if (!this.agg) return false;

    const snapshot = this.agg.snapshot();
    return snapshot.valid;
  }

  /** Push current state to parent */
  private updateParentSlice() {
    if (!this.agg) return;

    const snapshot = this.agg.snapshot();

    this.parent.updateSlice('location', snapshot.valid, snapshot.value);
  }
}
