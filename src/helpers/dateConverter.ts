/* 
Adding one to the month is mainly done because the method date.getMonth return a zero based value, which means it will show the previous month
*/

import dayjs from 'dayjs';
import moment from 'moment';

const convertDate = (date: string) => {
  return moment(date).format('DD-MM-YYYY');
};

const convertDateWithTimeStamp = (dateString: string | null | undefined) => {
  if (dateString === null) {
    return '';
  }

  return moment(dateString).format('DD-MM-YYYY HH:mm');
};

const checkEndDateIsUnset = (dateString: string) => {
  const date: Date = new Date(dateString);
  return date.getFullYear() === 2099;
};

const calculatePumpstop = (
  timeofmeas: string,
  pumpstop: string | null | undefined,
  service: boolean | null
) => {
  return pumpstop !== null && pumpstop !== undefined
    ? moment(timeofmeas).diff(moment(pumpstop), 'hours') + ' timer siden'
    : service === true
      ? 'I drift'
      : '-';
};

const limitDecimalNumbers = (value: number | null) => {
  return value !== null &&
    value !== undefined &&
    value.toString().split('.')[1] !== undefined &&
    value.toString().split('.')[1].length > 3
    ? value.toFixed(3)
    : value;
};

const splitTimeFromDate = (dateString: string) => {
  const date = moment(dateString).format('DD-MM-YYYY HH:mm');
  const time = date.split(' ');
  return time;
};

const convertToShorthandDate = (date: string | null | undefined) => {
  return dayjs(date).format('DD MMM YYYY');
};

export {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  calculatePumpstop,
  limitDecimalNumbers,
  splitTimeFromDate,
  convertToShorthandDate,
};
