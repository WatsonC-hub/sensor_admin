import moment from 'moment';
import {PejlingBoreholeItem, PejlingItem} from '../station/components/pejling/PejlingSchema';

export const initialData: PejlingItem = {
  timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
  measurement: 0,
  useforcorrection: 0,
  comment: '',
};

export const boreholeInitialData: PejlingBoreholeItem = {
  timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
  measurement: 0,
  useforcorrection: 0,
  comment: undefined,
  service: false,
  pumpstop: null,
  extrema: undefined,
};
