/* 
Adding one to the month is mainly done because the method date.getMonth return a zero based value, which means it will show the previous month
*/

import moment, {DurationInputArg2, Moment, unitOfTime} from 'moment';

const convertDate = (
  date: string | Date | undefined = undefined,
  format: string = 'DD-MM-YYYY'
) => {
  return moment(date).format(format);
};

const currentDate = (format?: string) => moment().format(format);

const toMoment = (date: string | undefined = undefined) => moment(date);

const minDate = (min: Moment, max: Moment, format = 'DD-MM-YYYY HH:mm') =>
  moment.min(min, max).format(format);

const maxDate = (min: Moment, max: Moment, format = 'DD-MM-YYYY HH:mm') =>
  moment.max(min, max).format(format);

const toISOString = (date: string | Date | undefined = undefined) => moment(date).toISOString();

const isDateValid = (date: string) => moment(date).isValid();

const isBefore = (startDate: string, endDate: string) =>
  moment(startDate).isBefore(moment(endDate));

const isAfter = (startDate: string, endDate: string) => moment(startDate).isAfter(moment(endDate));

const isSameOrAfter = (startDate: string, endDate: string) =>
  moment(startDate).isSameOrAfter(moment(endDate));

const subtractFromDate = (date: string, value: number, type: DurationInputArg2) =>
  moment(date).subtract(value, type);

const addValueToDate = (date: string, value: number, type: DurationInputArg2) =>
  moment(date).add(value, type);

const dateDiff = (
  date: string | undefined = undefined,
  dateToDiff: string | undefined = undefined,
  type?: unitOfTime.Diff
) => moment(date).diff(moment(dateToDiff), type);

const convertDateWithTimeStamp = (dateString: string | null) => {
  if (dateString === null || dateString === undefined) {
    return '';
  }
  return moment(dateString).format('DD-MM-YYYY HH:mm');
};

const formatMoment = (moment: Moment) => moment.format('DD-MM-YYYY HH:mm');

const checkEndDateIsUnset = (dateString: string) => {
  const date: Date = new Date(dateString);
  return date.getFullYear() === 2099;
};

const calculatePumpstop = (timeofmeas: string, pumpstop: string, service: boolean) => {
  return pumpstop !== null
    ? moment(timeofmeas).diff(moment(pumpstop), 'hours') + ' timer siden'
    : service === true
      ? 'I drift'
      : '-';
};

const splitTimeFromDate = (dateString: string) => {
  const date = moment(dateString).format('DD-MM-YYYY HH:mm');
  const time = date.split(' ');
  return time;
};

// what am I doing? (EBA)
const limitDecimalNumbers = (value: number | null) => {
  return value !== null &&
    value !== undefined &&
    value.toString().split('.')[1] !== undefined &&
    value.toString().split('.')[1].length > 3
    ? value.toFixed(3)
    : value;
};

const estimatedBatteryStatus = (estimated_date: string | undefined) => {
  const currentDate = moment().toString();

  const years = dateDiff(estimated_date, undefined, 'years');
  addValueToDate(currentDate, years, 'years');
  const months = dateDiff(estimated_date, undefined, 'months');
  addValueToDate(currentDate, months, 'months');
  const days = dateDiff(estimated_date, undefined, 'days');

  let text = '';
  if (years !== 0) {
    text += years + ' år';
  }

  let monthText = 'måned';
  if (months > 1) monthText = 'måneder';
  if (months !== 0 && days === 0) {
    text += ' og ' + months + ' måneder';
  } else if (months !== 0) {
    text += ' ' + months + ' ' + monthText;
  }

  return text;
};

export {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  calculatePumpstop,
  limitDecimalNumbers,
  splitTimeFromDate,
  toMoment,
  minDate,
  maxDate,
  toISOString,
  formatMoment,
  isDateValid,
  subtractFromDate,
  isBefore,
  isAfter,
  isSameOrAfter,
  dateDiff,
  addValueToDate,
  estimatedBatteryStatus,
  currentDate,
};
