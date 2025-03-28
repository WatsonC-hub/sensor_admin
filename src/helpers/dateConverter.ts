import dayjs, {ManipulateType, OpUnitType, QUnitType} from 'dayjs';
import dayJsIsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(dayJsIsSameOrAfter);
dayjs.extend(minMax);

const convertDate = (
  date: string | Date | undefined = undefined,
  format: string = 'DD-MM-YYYY'
) => {
  return dayjs(date).format(format);
};

const currentDate = (format?: string) => dayjs().format(format);

const toDate = (date: string | undefined = undefined) => dayjs(date);

const minDate = (min: string, max: string, format = 'DD-MM-YYYY HH:mm') => {
  return dayjs.min(dayjs(), dayjs(min), dayjs(max)).format(format);
};
const maxDate = (min: string, max: string, format = 'DD-MM-YYYY HH:mm') => {
  return dayjs.max(dayjs(), dayjs(min), dayjs(max)).format(format);
};

const toISOString = (date: string | Date | undefined = undefined) => dayjs(date).toISOString();

const isDateValid = (date: string) => dayjs(date).isValid();

const isBefore = (startDate: string, endDate: string) => dayjs(startDate).isBefore(dayjs(endDate));

const isAfter = (startDate: string, endDate: string) => dayjs(startDate).isAfter(dayjs(endDate));

const isSameOrAfter = (startDate: string, endDate: string) =>
  dayjs(startDate).isSameOrAfter(dayjs(endDate));

const subtractFromDate = (date: string, value: number, type: ManipulateType) =>
  dayjs(date).subtract(value, type);

const addValueToDate = (date: string, value: number, type: ManipulateType) =>
  dayjs(date).add(value, type);

const dateDiff = (
  date: string | undefined = undefined,
  dateToDiff: string | undefined = undefined,
  type?: OpUnitType | QUnitType
) => dayjs(date).diff(dayjs(dateToDiff), type);

const convertDateWithTimeStamp = (dateString: string | null) => {
  if (dateString === null || dateString === undefined) {
    return '';
  }
  return dayjs(dateString).format('DD-MM-YYYY HH:mm');
};

const formatMoment = (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm');

const checkEndDateIsUnset = (dateString: string) => {
  const date: Date = new Date(dateString);
  return date.getFullYear() === 2099;
};

const calculatePumpstop = (timeofmeas: string, pumpstop: string, service: boolean) => {
  return pumpstop !== null
    ? dayjs(timeofmeas).diff(dayjs(pumpstop), 'hours') + ' timer siden'
    : service === true
      ? 'I drift'
      : '-';
};

const splitTimeFromDate = (dateString: string) => {
  const date = dayjs(dateString).format('DD-MM-YYYY HH:mm');
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
  const currentDate = dayjs().toString();

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
  toDate,
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
