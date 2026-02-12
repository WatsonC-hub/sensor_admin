import React, {useState} from 'react';
import TimeseriesMetaForm from '../forms/TimeseriesMetaForm';
import WatlevmpSection from '../sections/WatlevmpSection';
import {RemoveCircleOutline} from '@mui/icons-material';
import {Grid2} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import {isSynchronizationAllowed} from './TimeseriesStepHelper';
import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';
import {TimeseriesPayload} from '../types';
import {useCreateStationStore} from '../state/useCreateStationStore';
import ControlSettingSection from '../sections/ControlSettingSection';
import SyncSection from '../sections/SyncSection';
import UnitSection from '../sections/UnitSection';
import {useQuery} from '@tanstack/react-query';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {apiClient} from '~/apiClient';
import {Tstype} from '~/types';

type Props = {
  index: string;
  onRemove: () => void;
};

const TimeseriesEditor = ({index, onRemove}: Props) => {
  const [timeseries, location_meta, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index] as TimeseriesPayload,
    state.formState.location?.meta,
    state.setState,
    state.deleteState,
  ]);

  const {data: timeseries_types} = useQuery({
    queryKey: queryKeys.timeseriesTypes(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Tstype>>(`/sensor_field/timeseries_types`);
      return data;
    },
    staleTime: Infinity, // Cache indefinitely
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch every 24 hours
  });

  const [showWatlevmp, setShowWatlevmp] = useState(!!timeseries.watlevmp);
  const [showControlSettings, setShowControlSettings] = useState(!!timeseries.control_settings);
  const [showSync, setShowSync] = useState(!!timeseries.sync);
  const [showUnit, setShowUnit] = useState(!!timeseries.unit);

  const meta_tstype_id = timeseries.meta?.tstype_id;
  const meta_intakeno = timeseries?.meta?.intakeno;

  const {data: dmpAllowedList} = useDMPAllowedList();

  const {isMobile} = useBreakpoints();

  const isSyncAllowed = isSynchronizationAllowed(
    meta_tstype_id,
    location_meta?.loctype_id,
    dmpAllowedList
  );

  return (
    <>
      <TimeseriesMetaForm
        uuid={index}
        setValues={(meta) => {
          setState(`timeseries.${index}.meta`, meta);
        }}
        setIntakeno={(intakeno) => {
          if (intakeno !== meta_intakeno) setState(`timeseries.${index}.meta.intakeno`, intakeno);
        }}
        setTstype={(tstype_id) => {
          setState(`timeseries.${index}.meta.tstype_id`, tstype_id);
          deleteState(`timeseries.${index}.unit`);
          deleteState(`timeseries.${index}.watlevmp`);

          if (tstype_id !== meta_tstype_id) {
            const service_interval = timeseries_types?.find(
              (type) => type.tstype_id === tstype_id
            )?.service_interval;
            if (service_interval !== null && service_interval !== undefined) {
              setState(`timeseries.${index}.control_settings`, {
                controls_per_year: 12 / service_interval,
                lead_time: null,
                selectValue: 1,
              });
            }
            setShowWatlevmp(true);
            setShowControlSettings(true);
          }
        }}
      />

      {meta_tstype_id && (
        <>
          {meta_tstype_id === 1 && (
            <WatlevmpSection index={index} show={showWatlevmp} setShow={setShowWatlevmp} />
          )}

          <UnitSection
            key={meta_tstype_id}
            uuid={index}
            tstype_id={meta_tstype_id}
            show={showUnit}
            setShow={setShowUnit}
          />

          <ControlSettingSection
            uuid={index}
            show={showControlSettings}
            setShow={setShowControlSettings}
          />

          {isSyncAllowed && (
            <SyncSection
              uuid={index}
              show={showSync}
              setShow={setShowSync}
              tstype_id={meta_tstype_id}
            />
          )}
        </>
      )}
      <Grid2
        size={isMobile ? 12 : 1}
        alignContent={'center'}
        display={'flex'}
        width={'100%'}
        justifyContent={'end'}
      >
        <Button
          bttype="tertiary"
          startIcon={<RemoveCircleOutline fontSize="small" />}
          onClick={() => {
            if (Object.keys(timeseries).length === 1) deleteState(`location.visibility`);
            onRemove();
          }}
        >
          Fjern tidsserie
        </Button>
      </Grid2>
    </>
  );
};

export default TimeseriesEditor;
