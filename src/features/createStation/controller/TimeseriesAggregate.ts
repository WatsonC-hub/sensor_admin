import {AggregateController} from './AggregateController';
import {TimeseriesPayload} from './types';

export type AggregateSnapshot<T> = {
  valid: boolean;
  validate: () => Promise<boolean>;
  value?: T;
};

export class TimeseriesAggregate {
  private controller = new AggregateController<TimeseriesPayload>();

  snapshot(): AggregateSnapshot<TimeseriesPayload> {
    const valid = this.controller.isValid();
    const payload = {
      valid,
      value: this.controller.getValues() as TimeseriesPayload,
      validate: async () => {
        const isValid = await this.controller.validateAllSlices();
        return isValid;
      },
    };
    return payload;
  }

  getController() {
    return this.controller;
  }
}
