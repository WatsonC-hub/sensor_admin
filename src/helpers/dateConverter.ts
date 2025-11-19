/* 
Adding one to the month is mainly done because the method date.getMonth return a zero based value, which means it will show the previous month
*/

import dayjs, {Dayjs} from 'dayjs';

const convertDate = (date: string | Dayjs) => {
  if (dayjs.isDayjs(date)) {
    return date.locale('da').format('L');
  }
  return dayjs(date).locale('da').format('L');
};

const convertDateWithTimeStamp = (dateInput: string | Dayjs | Date | null | undefined) => {
  if (dateInput === null || dateInput === undefined) {
    return '';
  }

  if (dayjs.isDayjs(dateInput)) {
    return dateInput.format('L LT');
  }

  const date = dayjs(dateInput);
  if (date.isValid()) {
    return date.format('L LT');
  }
  return '';
};

const convertToLocalDate = (date: dayjs.Dayjs | undefined) => {
  return date?.format('L LT');
};

const checkEndDateIsUnset = (dateString: string | Dayjs) => {
  if (dayjs.isDayjs(dateString)) {
    return dateString.year() === 2099;
  }

  const date = dayjs(dateString);
  return date.year() === 2099;
};

const calculatePumpstop = (
  timeofmeas: string | Dayjs,
  pumpstop: string | Dayjs | null | undefined,
  service: boolean | null
) => {
  if (dayjs.isDayjs(timeofmeas)) {
    timeofmeas = timeofmeas.toISOString();
  }
  if (dayjs.isDayjs(pumpstop)) {
    pumpstop = pumpstop.toISOString();
  }

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

export {
  convertDate,
  checkEndDateIsUnset,
  convertDateWithTimeStamp,
  calculatePumpstop,
  limitDecimalNumbers,
  splitTimeFromDate,
  convertToLocalDate,
};
