import React from 'react';
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

type Props = {
  index: string;
  onRemove: () => void;
  setControlSettings: (tstype_id: number) => void;
};

const TimeseriesEditor = ({index, onRemove, setControlSettings}: Props) => {
  const [timeseries, location_meta, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index] as TimeseriesPayload,
    state.formState.location?.meta,
    state.setState,
    state.deleteState,
  ]);

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
            setControlSettings(tstype_id);
          }

          if (tstype_id == 1) {
            setState(`timeseries.${index}.watlevmp`, {});
          }
        }}
      />

      {meta_tstype_id && (
        <>
          {meta_tstype_id === 1 && <WatlevmpSection index={index} />}
          <UnitSection key={meta_tstype_id} uuid={index} tstype_id={meta_tstype_id} />

          <ControlSettingSection
            uuid={index}
            setShow={(show) => {
              if (!show) deleteState(`timeseries.${index}.control_settings`);
              if (show) setControlSettings(meta_tstype_id);
            }}
          />

          {isSyncAllowed && <SyncSection uuid={index} tstype_id={meta_tstype_id} />}
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
