/* 
Adding one to the month is mainly done because the method date.getMonth return a zero based value, which means it will show the previous month
*/

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
  const seconds: string = setTrailingZero(date.getSeconds());
  return `${day}-${month}-${date.getFullYear()} ${hours}:${minutes}:${seconds}`;
};

const checkEndDateIsUnset = (dateString: string) => {
  const date: Date = new Date(dateString);
  return date.getFullYear() === 2099;
};

const setTrailingZero = (number: number) => {
  return number < 10 ? '0' + number : number.toString();
};

export {convertDate, checkEndDateIsUnset, convertDateWithTimeStamp};
