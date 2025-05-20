import moment from 'moment';
import {
  PejlingBoreholeSchemaType,
  PejlingSchemaType,
} from '../station/components/pejling/PejlingSchema';

export const initialData = () =>
  ({
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  }) as PejlingSchemaType;

export const boreholeInitialData = () =>
  ({
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
    service: false,
    pumpstop: null,
    extrema: undefined,
  }) as PejlingBoreholeSchemaType;
