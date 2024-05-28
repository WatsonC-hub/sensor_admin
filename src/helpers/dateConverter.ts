/* 
Adding one to the month is mainly done because the method date.getMonth return a zero based value, which means it will show the previous month
*/

import moment from 'moment';

const convertDate = (dateString: string) => {
  const date: Date = new Date(dateString);
  const day: string = setTrailingZero(date.getDate());
  const month: string = setTrailingZero(date.getMonth() + 1);
  return `${day}-${month}-${date.getFullYear()}`;
};

const convertDateWithTimeStamp = (dateString: string) => {
  const date: Date = new Date(dateString);
  const day: string = setTrailingZero(date.getDate());
  const month: string = setTrailingZero(date.getMonth() + 1);
  const hours: string = setTrailingZero(date.getHours());
  const minutes: string = setTrailingZero(date.getMinutes());
  return `${day}-${month}-${date.getFullYear()} ${hours}:${minutes}`;
};

const checkEndDateIsUnset = (dateString: string) => {
  const date: Date = new Date(dateString);
  return date.getFullYear() === 2099;
};

const setTrailingZero = (number: number) => {
  return number < 10 ? '0' + number : number.toString();
};

const calculatePumpstop = (timeofmeas: string, pumpstop: string, service: boolean) => {
  return pumpstop !== null
    ? moment(timeofmeas).diff(moment(pumpstop), 'hours') + ' timer siden'
    : service === true
      ? 'I drift'
      : '-';
};

const limitDecimalNumbers = (value: number) => {
  return value !== null &&
    value !== undefined &&
    value.toString().split('.')[1] !== undefined &&
    value.toString().split('.')[1].length > 3
    ? value.toFixed(3)
    : value;
};

export {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  calculatePumpstop,
  limitDecimalNumbers,
};
