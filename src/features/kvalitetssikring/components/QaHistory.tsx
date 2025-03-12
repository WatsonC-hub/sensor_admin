import {Box, Skeleton} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import {qaHistorySkeletonHeight} from '~/consts';
import {AdjustmentTypes} from '~/helpers/EnumHelper';
import {useAppContext} from '~/state/contexts';

import {useCertifyQa} from '../api/useCertifyQa';

import AdjustmentDataTable from './AdjustmentDataTable';

export default function QAHistory2() {
  const {ts_id} = useAppContext(['ts_id']);
  const {
    get: {data: certify},
  } = useCertifyQa(ts_id);

  const {data, isPending} = useQuery({
    queryKey: ['qa_all', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${ts_id}`);
      return data;
    },
    select: (data) => {
      const out = [];

      data.levelcorrection.forEach((item: any) => {
        out.push({
          data: item,
          type: AdjustmentTypes.LEVELCORRECTION,
        });
      });

      data.dataexclude.forEach((item: any) => {
        if (item.max_value == null) {
          out.push({
            data: item,
            type: AdjustmentTypes.EXLUDETIME,
          });
        } else {
          out.push({
            data: item,
            type: AdjustmentTypes.EXLUDEPOINTS,
          });
        }
      });
      if (data.min_max_cutoff) {
        out.push({
          data: data.min_max_cutoff,
          type: AdjustmentTypes.MINMAX,
        });
      }

      return out;
    },
    enabled: typeof ts_id == 'number',
    refetchOnWindowFocus: false,
  });

  if (certify) {
    certify.forEach((item) => {
      data?.push({
        data: item,
        type: AdjustmentTypes.APPROVED,
      });
    });
  }

  if (isPending)
    return (
      <Box>
        <Skeleton
          sx={{
            height: qaHistorySkeletonHeight,
            width: '100%',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
        <Skeleton
          sx={{
            height: qaHistorySkeletonHeight,
            width: '100%',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
        <Skeleton
          sx={{
            height: qaHistorySkeletonHeight,
            width: '100%',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
      </Box>
    );

  return (
    <Box>
      <AdjustmentDataTable data={data} />
    </Box>
  );
}
