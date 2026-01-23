import {AggregateController} from '../controller/AggregateController';
import {AggregateSnapshot} from '../controller/TimeseriesAggregate';

export function wireChildToParent<
  TChild,
  TParent extends Record<string, any>,
  K extends keyof TParent,
>(
  child: {snapshot: () => AggregateSnapshot<TChild>; controller: AggregateController<any>},
  parent: AggregateController<TParent>,
  parentKey: K
) {
  const emit = () => {
    const snap = child.snapshot();
    parent.updateSlice(parentKey, snap.valid, snap.value as any);
  };

  const offValidity = child.controller.onValidityChange(emit);
  const offSlice = child.controller.onSliceChange(emit);

  return () => {
    offValidity();
    offSlice();
  };
}
