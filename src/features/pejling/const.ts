import moment from 'moment';
import {PejlingBoreholeItem, PejlingItem} from '../station/components/pejling/PejlingSchema';

export const initialData = () =>
  ({
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  }) as PejlingItem;

export const boreholeInitialData = () =>
  ({
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: undefined,
    service: false,
    pumpstop: null,
    extrema: undefined,
  }) as PejlingBoreholeItem;
