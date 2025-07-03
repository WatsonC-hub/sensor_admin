import dayjs from 'dayjs';
import {z} from 'zod';

const zodDayjs = (message: string) =>
  z.custom<dayjs.Dayjs>(
    (val) => {
      return dayjs.isDayjs(val) && val.isValid();
    },
    {
      message,
    }
  );

export {zodDayjs};
