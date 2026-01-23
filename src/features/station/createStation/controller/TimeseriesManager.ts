import {wireChildToParent} from '../helper/wireChildToParent';
import {AggregateController} from './AggregateController';
import {TimeseriesAggregate} from './TimeseriesAggregate';
import {RootPayload} from './types';

type Listener = () => void;

export class TimeseriesManager {
  private parent: AggregateController<RootPayload>;
  private items = new Map<
    string,
    {
      agg: TimeseriesAggregate;
      unsubscribe: () => void;
    }
  >();

  private listeners = new Set<Listener>();

  constructor(parent: AggregateController<RootPayload>) {
    this.parent = parent;
    // parent slice for timeseries array
    this.parent.registerSlice('timeseries', true);
  }

  /** Subscribe to changes in the list */
  onChange(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notify all listeners */
  private emit() {
    this.listeners.forEach((l) => l());
    // this.updateParentSlice();
  }

  /** Add a new timeseries */
  add(id: string) {
    if (this.items.has(id)) return this.items.get(id)!.agg;

    const agg = new TimeseriesAggregate();

    const unsubscribe = wireChildToParent(
      {
        snapshot: () => agg.snapshot(),
        controller: agg.getController(),
      },
      this.parent,
      'timeseries'
    );

    this.items.set(id, {agg, unsubscribe});
    this.updateParentSlice();
    this.emit(); // notify observers
    return agg;
  }

  /** Remove an existing timeseries */
  remove(id: string) {
    const item = this.items.get(id);
    if (!item) return;

    item.unsubscribe();
    this.items.delete(id);
    this.updateParentSlice();
    this.emit(); // notify observers
  }

  /** Get a timeseries aggregate by ID */
  get(id: string) {
    return this.items.get(id)?.agg;
  }

  /** List all children */
  list() {
    return Array.from(this.items.entries()).map(([id, v]) => ({
      id,
      agg: v.agg,
    }));
  }

  /** Update parent slice with current valid values */
  private updateParentSlice() {
    const snapshots = Array.from(this.items.values()).map((i) => i.agg.snapshot());
    console.log('TimeseriesManager updating parent slice with snapshots:', snapshots);
    const valid = snapshots.every((s) => s.valid);
    const values = snapshots.map((s) => s.value!);

    console.log('Updating parent timeseries slice:', {valid, values});

    this.parent.updateSlice('timeseries', valid, values);
  }
}
