import {Box, Card, CardContent, Skeleton, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useContext} from 'react';

import {apiClient} from '~/apiClient';
import {qaHistorySkeletonHeight} from '~/consts';
import {ExcludeData} from '~/hooks/query/useExclude';
import ExcludeRow from '~/pages/admin/kvalitetssikring/components/ExcludeRow';
import LevelCorrectionRow from '~/pages/admin/kvalitetssikring/components/LevelCorrectionRow';
import QAAccordion from '~/pages/admin/kvalitetssikring/components/QAAccordion';
import YRangeRow from '~/pages/admin/kvalitetssikring/components/YRangeRow';
import {MetadataContext} from '~/state/contexts';
import {LevelCorrection} from '~/types';

export default function QAHistory() {
  const metadata = useContext(MetadataContext);
  const {data, isLoading} = useQuery({
    queryKey: ['qa_all', metadata?.ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${metadata?.ts_id}`);
      return data;
    },
    enabled: typeof metadata?.ts_id == 'number',
    refetchOnWindowFocus: false,
  });

  if (isLoading)
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
    <Card raised sx={{borderRadius: 4, my: 1, '& .MuiCardContent-root': {'&:last-child': {p: 0}}}}>
      <CardContent sx={{p: 0}}>
        <QAAccordion number={1} title="Fjernede tidsintervaller">
          {data?.dataexclude
            .filter((elem: ExcludeData) => elem.min_value == null && elem.max_value == null)
            .map((item: ExcludeData, index: number) => (
              <ExcludeRow
                key={item.gid}
                data={item}
                index={index}
                lastElement={
                  data?.dataexclude.filter(
                    (elem: ExcludeData) => elem.min_value == null && elem.max_value == null
                  ).length -
                    1 ===
                  index
                }
              />
            ))}
          {data?.dataexclude.filter(
            (elem: ExcludeData) => elem.min_value == null && elem.max_value == null
          ).length == 0 && <Typography>Ingen fjernede tidsintervaller</Typography>}
        </QAAccordion>

        <QAAccordion number={2} title="Korriger spring">
          {data?.levelcorrection.map((item: LevelCorrection, index: number) => (
            <LevelCorrectionRow
              key={item.gid}
              data={item}
              index={index}
              lastElement={data?.levelcorrection.length - 1 === index}
            />
          ))}
          {data?.levelcorrection.length == 0 && <Typography>Ingen spring korrektioner</Typography>}
        </QAAccordion>
        <QAAccordion number={3} title="Kotesætning">
          <Typography>Her fungerer kotesætning</Typography>
        </QAAccordion>
        <QAAccordion number={4} title="Fjernede datapunkter">
          {data?.dataexclude
            .filter((elem: ExcludeData) => elem.min_value != null || elem.max_value != null)
            .map((item: ExcludeData, index: number) => (
              <ExcludeRow
                key={item.gid}
                data={item}
                index={index}
                isWithYValues
                lastElement={
                  data?.dataexclude.filter(
                    (elem: ExcludeData) => elem.min_value != null || elem.max_value != null
                  ).length -
                    1 ===
                  index
                }
              />
            ))}
          {data?.dataexclude.filter(
            (elem: ExcludeData) => elem.min_value != null || elem.max_value != null
          ).length == 0 && <Typography>Ingen fjernede datapunkter</Typography>}
        </QAAccordion>
        <QAAccordion number={5} title="Valide værdier">
          {data?.min_max_cutoff ? (
            <YRangeRow data={data.min_max_cutoff} />
          ) : (
            <Typography>Intet range defineret</Typography>
          )}
        </QAAccordion>
        {/* <QAAccordion number={5} title="Spikes"></QAAccordion> */}
      </CardContent>
    </Card>
  );
}
