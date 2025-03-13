import {Notification} from '~/hooks/query/useNotificationOverview';

export type IconDetails = Partial<Notification>;

/*{
  color?: string | null;
  notification_id?: NotificationIDEnum;
  flag?: FlagEnum;
  loctype_id?: number | string;
  calculated?: boolean | null;
  opgave?: string | null;
  active?: boolean | null;
  status?: 'SCHEDULED' | 'POSTPONED' | 'IGNORED' | null;
  notify_type?: 'obs' | 'station' | 'primary' | null;
  isqa?: boolean;
  type?: 'task' | 'notification' | 'none'
}*/
