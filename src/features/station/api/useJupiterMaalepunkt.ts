import {queryOptions, useQuery} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {MaalepunktTableData} from '~/types';

type LastJupiterMPData = {
  descriptio: string | undefined;
  elevation: number | null;
  startdate: Dayjs;
};

const getJupiterMaalepunktOptions = (
  boreholeno: string | undefined,
  intakeno: number | undefined
) =>
  queryOptions<LastJupiterMPData, APIError, Array<MaalepunktTableData>>({
    queryKey: queryKeys.Borehole.lastMP(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPData>(
        `/sensor_field/borehole/last_mp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    select: (data) => [
      {
        mp_description: data.descriptio ?? '',
        elevation: data.elevation ?? 0,
        startdate: dayjs(data.startdate).format('YYYY-MM-DD HH:mm:ss'),
        enddate: '', // Provide default or map if available
        organisationid: -1, // Provide default or map if available
        organisationname: '', // Provide default or map if available
        gid: -1, // Provide default or map if available
        boreholeno: boreholeno, // Provide default or map if available
        intakeno: intakeno, // Provide default or map if available
        ts_id: -1, // Provide default or map if available
        userid: '', // Provide default or map if available
      },
    ],
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
  });

const useJupiterMaalepunkt = () => {
  const {boreholeno, intakeno} = useAppContext(undefined, ['boreholeno', 'intakeno']);
  const get = useQuery(getJupiterMaalepunktOptions(boreholeno, intakeno));

  return {
    get,
  };
};

export default useJupiterMaalepunkt;
