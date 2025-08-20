import {
  PejlingBoreholeSchemaType,
  PejlingSchemaType,
} from '../station/components/pejling/PejlingSchema';
import dayjs from 'dayjs';

export const initialData = () =>
  ({
    timeofmeas: dayjs(),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  }) as PejlingSchemaType;

export const boreholeInitialData = () =>
  ({
    timeofmeas: dayjs(),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
    service: false,
    pumpstop: null,
    extrema: undefined,
  }) as PejlingBoreholeSchemaType;
