/* 
Adding one to the month is mainly done because the method date.getMonth return a zero based value, which means it will show the previous month
*/

import dayjs from 'dayjs';

const convertDate = (date: string) => {
  return dayjs(date).locale('da').format('L');
};

const convertDateWithTimeStamp = (dateString: string | null | undefined) => {
  if (dateString === null) {
    return '';
  }

  const date = dayjs(dateString).format('L LT');
  return date;
};

const convertToLocalDate = (date: dayjs.Dayjs | undefined) => {
  return date?.format('L LT');
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
    ? dayjs(timeofmeas).diff(dayjs(pumpstop), 'hours') + ' timer siden'
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
  const date = dayjs(dateString).format('L LT');
  const time = date.split(' ');
  return time;
};

const convertToShorthandDate = (date: string | null | undefined) => {
  return dayjs(date).format('ll');
};

export {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  calculatePumpstop,
  limitDecimalNumbers,
  splitTimeFromDate,
  convertToShorthandDate,
  convertToLocalDate,
};
