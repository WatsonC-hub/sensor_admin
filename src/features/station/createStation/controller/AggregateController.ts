import {SliceState} from './types';
type ValidityListener = (valid: boolean) => void;
type SliceListener<T> = (id: keyof T, slice: SliceState<T[keyof T]> | undefined) => void;

export class AggregateController<T extends Record<string, any>> {
  private slices: Partial<{[K in keyof T]: SliceState<T[K]>}> = {};

  private validityListeners = new Set<ValidityListener>();
  private sliceListeners = new Set<SliceListener<T>>();

  onValidityChange(listener: ValidityListener) {
    this.validityListeners.add(listener);
    return () => this.validityListeners.delete(listener);
  }

  onSliceChange(listener: SliceListener<T>) {
    this.sliceListeners.add(listener);
    return () => this.sliceListeners.delete(listener);
  }

  private emitValidity() {
    const valid = this.isValid();
    this.validityListeners.forEach((l) => l(valid));
  }

  private emitSliceChange<K extends keyof T>(id: K) {
    const slice = this.slices[id];
    this.sliceListeners.forEach((l) => l(id, slice));
  }

  registerSlice<K extends keyof T>(id: K, required: boolean, validate?: () => Promise<boolean>) {
    this.slices[id] = {
      required,
      valid: false,
      validate,
    };
    this.emitSliceChange(id);
    this.emitValidity();
  }

  unregisterSlice<K extends keyof T>(id: K) {
    delete this.slices[id];
    this.emitSliceChange(id);
    this.emitValidity();
  }

  updateSlice<K extends keyof T>(id: K, valid: boolean, value?: T[K]) {
    const slice = this.slices[id];
    if (!slice) return;

    slice.valid = valid;
    slice.value = value;

    this.emitSliceChange(id);
    this.emitValidity();
  }

  async validateAllSlices(): Promise<boolean> {
    let isValid = true;

    for (const key in this.slices) {
      const slice = this.slices[key as keyof T];
      if (slice?.validate) {
        const sliceValid = await slice.validate();
        slice.valid = sliceValid;
        isValid = isValid && sliceValid;
      }
    }

    return isValid;
  }

  isValid(): boolean {
    return Object.values(this.slices).every((slice) =>
      slice ? (slice.required ? slice.valid : !slice.value || slice.valid) : true
    );
  }

  getValues(): Partial<T> {
    const values: Partial<T> = {};
    for (const key in this.slices) {
      const slice = this.slices[key as keyof T];
      if (slice?.value !== undefined) {
        values[key as keyof T] = slice.value;
      }
    }
    return values;
  }

  getSlices() {
    return this.slices;
  }
}
