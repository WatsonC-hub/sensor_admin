import {MapOverview} from '~/hooks/query/useNotificationOverview';
import {BoreholeMapData} from '~/types';

export type IconDetails = Partial<
  MapOverview & {
    color?: string | null;
    due_date?: string | null;
  }
>;
export type BoreholeDetails = Partial<BoreholeMapData>;

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
