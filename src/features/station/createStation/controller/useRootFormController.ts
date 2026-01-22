import {useState, useCallback} from 'react';
import {useAggregateController} from './useAggregateController';
import {RootPayload, TimeseriesPayload} from './types';

type TimeseriesController = ReturnType<typeof useAggregateController<TimeseriesPayload>>;

export function useRootFormController() {
  const [timeseries, setTimeseries] = useState<Record<string, TimeseriesController>>({});

  const aggregate = useAggregateController<RootPayload>();

  console.log('Aggregate slices in RootFormController:', aggregate.getSlices());
  console.log('Timeseries controllers in RootFormController:', timeseries);

  const registerTimeseries = useCallback((id: string, controller: TimeseriesController) => {
    setTimeseries((prev) => ({
      ...prev,
      [id]: controller,
    }));
  }, []);

  const removeTimeseries = useCallback((id: string) => {
    setTimeseries((prev) => {
      const rest = {...prev};
      delete rest[id];
      return rest;
    });
  }, []);

  const validateAllSlices = useCallback(async () => {
    console.log('Validating all slices in RootFormController');
    const isValid = await aggregate.validateAllSlices();
    return isValid;
  }, [aggregate]);

  const isSubmittable = aggregate.isValid() && Object.values(timeseries).every((ts) => ts.isValid);

  const buildPayload = (): RootPayload => {
    const slices = aggregate.getSlices();
    return {
      ...(slices.location?.value && {location: slices.location.value}),
      timeseries: Object.values(timeseries)
        .filter((ts) => ts.isValid)
        .map((ts) => ts.getValues()),
    };
  };

  return {
    aggregate,
    registerTimeseries,
    removeTimeseries,
    validateAllSlices,
    isSubmittable,
    buildPayload,
    timeseries,
  };
}
