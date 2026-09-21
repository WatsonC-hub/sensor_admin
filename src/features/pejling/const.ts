import {
  PejlingBoreholeSchemaType,
  PejlingSchemaType,
} from '../station/components/pejling/PejlingSchema';
import dayjs from 'dayjs';

export const initialData = () =>
  ({
    timeofmeas: dayjs().startOf('minute'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
    correction_date: null,
  }) as PejlingSchemaType;

export const boreholeInitialData = () =>
  ({
    timeofmeas: dayjs().startOf('minute'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
    service: false,
    pumpstop: null,
    extrema: undefined,
    correction_date: null,
  }) as PejlingBoreholeSchemaType;
