import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

const activitySchema = z.object({
  created_at: zodDayjs('Tidspunkt skal være udfyldt'),
  id: z.number().optional().default(-1),
  onTimeseries: z.boolean().optional().default(false),
  flag_ids: z.array(z.number()).optional().default([]),
  comment: z.string().optional(),
});

export type ActivitySchemaType = z.infer<typeof activitySchema>;

export type CommentRow = {
  id: string;
  kind: 'comment';
  scope: 'location' | 'timeseries';
  comment: string;
  flags: Array<string>;
  pinned: boolean;
  createdAt: string;
  createdBy: string;
};

export type EventRow = {
  id: string;
  kind: 'event';
  eventType: 'equipment_replaced' | 'image_added';
  label: string;
  createdAt: string;
  createdBy: 'system' | string;
};

export type ActivityRow = CommentRow | EventRow;

export {activitySchema};
