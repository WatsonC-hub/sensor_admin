import dayjs from 'dayjs';
import {z} from 'zod';

import type {Dayjs} from 'dayjs';

const zodDayjs = (message?: string) =>
  z.preprocess(
    (val) => {
      if (typeof val === 'string' || val instanceof Date) {
        const parsed = dayjs(val);
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
// z.custom<Dayjs>(
//   (val) => {
//     return dayjs.isDayjs(val);
//   },
//   {
//     message,
//   }
// );
// z.preprocess(
//   (val) => {
//     if (typeof val === 'string' || val instanceof Date) {
//       const parsed = dayjs(val);
//       return parsed.isValid() ? parsed : null;
//     }
//     if (dayjs.isDayjs(val)) {
//       return val;
//     }
//     return null;
//   },
//   z.custom<Dayjs>(
//     (val) => {
//       return dayjs.isDayjs(val);
//     },
//     {
//       message,
//     }
//   )
// );

export {zodDayjs};
