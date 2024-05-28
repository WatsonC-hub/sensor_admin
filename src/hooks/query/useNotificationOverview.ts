import {useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

const exampleNotification = {
  locname: 'Robert Andersen ',
  locid: 9475,
  stationname: 'Robert Andersen  -  Vandstand',
  stationid: 12195,
  x: 500518,
  y: 6090724,
  longitude: 9.008090378521734,
  latitude: 54.963448062160616,
  terminalid: 'NB1020',
  opgave: 'Plateau',
  dato: '2024-05-23T08:15:04+02:00',
  color: '#334FFF',
  flag: 0,
  notification_id: 12,
  status: null,
  enddate: null,
  projectno: '23.0042',
  is_customer_service: true,
};

interface Notification {
  locname: string;
  locid: number;
  stationname: string;
  stationid: number;
  x: number;
  y: number;
  longitude: number;
  latitude: number;
  terminalid: string;
  opgave: string;
  dato: string;
  color: string;
  flag: number;
  notification_id: number;
  status: string | null;
  enddate: string | null;
  projectno: string;
  is_customer_service: boolean;
}

export const useNotificationOverview = () => {
  const query = useQuery<Notification[]>({
    queryKey: ['overblik'],
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
  return query;
};
