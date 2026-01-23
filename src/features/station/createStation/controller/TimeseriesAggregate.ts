import {AggregateController} from './AggregateController';
import {TimeseriesPayload} from './types';

export type AggregateSnapshot<T> = {
  valid: boolean;
  value?: T;
};

export class TimeseriesAggregate {
  private controller = new AggregateController<TimeseriesPayload>();

  snapshot(): AggregateSnapshot<TimeseriesPayload> {
    const valid = this.controller.isValid();
    const payload = {
      valid,
      value: valid ? (this.controller.getValues() as TimeseriesPayload) : undefined,
    };
    console.log(payload);
    return payload;
  }

  getController() {
    return this.controller;
  }
}
