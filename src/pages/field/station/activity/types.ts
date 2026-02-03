import {Dayjs} from 'dayjs';
import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

const FlagValues = z.union([z.string(), z.number(), z.null()]);

const activitySchema = z.object({
  created_at: zodDayjs('Tidspunkt skal være udfyldt'),
  id: z.string().optional().default(''),
  flag_ids: z.array(z.number()).optional().default([]),
  flags: z.record(z.string(), FlagValues),
  // comment: z.string().default(''),
});

export type ActivitySchemaType = z.infer<typeof activitySchema>;

type BaseRow = {
  id: string;
  kind: 'comment' | 'event';
  flags?: Record<number, number | string | null>;
  pinned?: boolean;
  scope: 'location' | 'timeseries';
  created_at: string;
  created_by: string | null;
};

export type CommentRow = BaseRow & {
  kind: 'comment';
  flags: Record<number, number | string | null>;
  pinned: boolean;
};

export type EventRow = BaseRow & {
  kind: 'event';
  flags?: never;
  pinned?: never;
  comment?: string;
};

export type ActivityRow = CommentRow | EventRow;

export type ActivityOption = {
  id: number;
  key: string;
  label: string;
  description: string;
  input_type: 'number' | 'text' | 'null' | 'textarea';
};

export type ActivityPost = {
  id: string;
  loc_id?: number;
  ts_id?: number;
  created_at: Dayjs;
  flags: Record<number, number | string | null>;
};

export {activitySchema};
