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
      validate?: () => Promise<boolean>;
    }
  >([]);

  private listeners = new Set<Listener>();

  constructor(parent: AggregateController<RootPayload>) {
    this.parent = parent;
    // parent slice for timeseries array
    this.parent.registerSlice('timeseries', true, async () => {
      return await this.validateAllSlices();
    });
  }

  /** Subscribe to changes in the list */
  onChange(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notify all listeners */
  private emit() {
    this.listeners.forEach((l) => l());
  }

  /** Add a new timeseries */
  add(id: string) {
    if (this.items.has(id)) return this.items.get(id)!.agg;

    const agg = new TimeseriesAggregate();

    const unsubSlice = agg.getController().onSliceChange(() => {
      this.updateParentSlice();
    });

    const unsubscribe = () => {
      unsubSlice();
    };

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

  clear() {
    if (this.items.size === 0) return;

    this.items.forEach(({unsubscribe}) => unsubscribe());
    this.items.clear();
    // Clear parent slice
    this.parent.updateSlice('timeseries', false, undefined);
    this.emit();
  }

  /** Validate all timeseries slices */
  private async validateAllSlices() {
    let isValid = true;
    for (const [, item] of this.items.entries()) {
      if (item.agg) {
        const snapshot = item.agg.snapshot();
        const valid = await snapshot.validate?.();

        isValid = isValid && (valid || false);
      }
    }
    return isValid;
  }

  /** Update parent slice with current valid values */
  private updateParentSlice() {
    const snapshots = this.list().map(({agg}) => agg.snapshot());

    const valid = snapshots.every((s) => s.valid);
    const values = snapshots.filter((s) => s.valid).map((s) => s.value!);

    this.parent.updateSlice('timeseries', valid, values);
  }
}
