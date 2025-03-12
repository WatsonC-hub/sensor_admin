import {FlagEnum, NotificationIDEnum} from './consts';

export type IconDetails = {
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
};
