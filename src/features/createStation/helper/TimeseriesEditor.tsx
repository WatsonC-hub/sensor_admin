import React, {useState} from 'react';
import TimeseriesMetaForm from '../forms/TimeseriesMetaForm';
import WatlevmpSection from '../sections/WatlevmpSection';
import {Delete} from '@mui/icons-material';
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
import VisibilitySection from '../sections/VisibilitySection';

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

  const [showWatlevmp, setShowWatlevmp] = useState(!!timeseries.watlevmp);
  const [showControlSettings, setShowControlSettings] = useState(!!timeseries.control_settings);
  const [showSync, setShowSync] = useState(!!timeseries.sync);
  const [showUnit, setShowUnit] = useState(!!timeseries.unit);
  const [showVisibility, setShowVisibility] = useState(!!timeseries.visibility);

  const tstype_id = timeseries.meta?.tstype_id;

  const {data: dmpAllowedList} = useDMPAllowedList();

  const {isMobile} = useBreakpoints();

  const isSyncAllowed = isSynchronizationAllowed(
    tstype_id,
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
        setTstype={(tstype_id) => {
          setState(`timeseries.${index}.meta.tstype_id`, tstype_id);
          deleteState(`timeseries.${index}.unit`);
          deleteState(`timeseries.${index}.watlevmp`);
          if (showWatlevmp) setShowWatlevmp(false);
        }}
      />

      <VisibilitySection uuid={index} show={showVisibility} setShow={setShowVisibility} />

      <ControlSettingSection
        uuid={index}
        show={showControlSettings}
        setShow={setShowControlSettings}
      />

      {tstype_id && (
        <UnitSection
          key={tstype_id}
          uuid={index}
          tstype_id={tstype_id}
          show={showUnit}
          setShow={setShowUnit}
        />
      )}

      {tstype_id === 1 && (
        <WatlevmpSection index={index} show={showWatlevmp} setShow={setShowWatlevmp} />
      )}

      {isSyncAllowed && (
        <SyncSection uuid={index} show={showSync} setShow={setShowSync} tstype_id={tstype_id} />
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
          startIcon={<Delete />}
          onClick={() => {
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
