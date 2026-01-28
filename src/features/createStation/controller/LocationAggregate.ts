import {AggregateController} from './AggregateController';
import {LocationController, CreateLocationData, LocationFormState} from './types';

export type AggregateSnapshot<T> = {
  valid: boolean;
  validate: () => Promise<boolean>;
  value?: T;
};

export class LocationAggregate {
  private controller: LocationController = new AggregateController<LocationFormState>();

  constructor(defaultState: CreateLocationData) {
    this.controller.registerSlice('meta', true);
    this.controller.updateSlice('meta', true, defaultState);
  }

  snapshot(): AggregateSnapshot<LocationFormState> {
    const valid = this.controller.isValid();
    const payload = {
      valid,
      value: this.controller.getValues() as LocationFormState,
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
