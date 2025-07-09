import dayjs, {Dayjs} from 'dayjs';
import {z} from 'zod';

const zodDayjs = (message?: string) =>
  z.preprocess(
    (val) => {
      console.log('zodDayjs preprocess', val);
      if (typeof val === 'string' || val instanceof Date) {
        const parsed = dayjs(val);
        console.log('Parsed Dayjs:', parsed);
        return parsed.isValid() ? parsed : null;
      }
      if (dayjs.isDayjs(val)) {
        return val;
      }
      return null;
    },
    z.custom<Dayjs>(
      (val) => {
        return dayjs.isDayjs(val);
      },
      {
        message,
      }
    )
  );

export {zodDayjs};
