import {Dayjs} from 'dayjs';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

const activitySchema = z.object({
  created_at: zodDayjs('Tidspunkt skal være udfyldt'),
  id: z.number().optional().default(-1),
  onTimeseries: z.preprocess((val) => val === 'true', z.boolean()).default(false),
  flag_ids: z.array(z.number()).optional().default([]),
  comment: z.string().default(''),
});

export type ActivitySchemaType = z.infer<typeof activitySchema>;

type BaseRow = {
  id: string;
  kind: 'comment' | 'event';
  comment: string;
  flags?: Array<number>;
  pinned?: boolean;
  scope: 'location' | 'timeseries';
  createdAt: string;
  createdBy: 'system' | string;
};

export type CommentRow = BaseRow & {
  kind: 'comment';
  flags: Array<number>;
  pinned: boolean;
};

export type EventRow = BaseRow & {
  kind: 'event';
  flags?: never;
  pinned?: never;
};

export type ActivityRow = CommentRow | EventRow;

export type ActivityOption = {
  id: number;
  key: string;
  label: string;
  description: string;
};

export type ActivityPost = {
  id: number;
  loc_id?: number;
  ts_id?: number;
  created_at: Dayjs;
  flag_ids: number[];
  comment: string;
};

export {activitySchema};
