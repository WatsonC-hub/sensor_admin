import {AggregateController} from './AggregateController';
import {LocationController, LocationData, LocationPayload} from './types';

export type AggregateSnapshot<T> = {
  valid: boolean;
  validate: () => Promise<boolean>;
  value?: T;
};

export class LocationAggregate {
  private controller: LocationController = new AggregateController<LocationPayload>();

  constructor(defaultState: LocationData) {
    this.controller.registerSlice('meta', true);
    this.controller.updateSlice('meta', true, defaultState);
  }

  snapshot(): AggregateSnapshot<LocationPayload> {
    const valid = this.controller.isValid();
    const payload = {
      valid,
      value: this.controller.getValues() as LocationPayload,
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
