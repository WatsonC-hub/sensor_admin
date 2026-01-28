import React, {useEffect, useState} from 'react';
import TimeseriesMetaForm from '../forms/TimeseriesMetaForm';
import WatlevmpSection from '../sections/WatlevmpSection';
import {Delete} from '@mui/icons-material';
import {Grid2} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import ControlSettingSection from '../sections/ControlSettingSection';
import {TimeseriesAggregate} from '../controller/TimeseriesAggregate';
import {TimeseriesMeta} from '~/helpers/CreateStationContextProvider';
import SyncSection from '../sections/SyncSection';
import {isSynchronizationAllowed} from './TimeseriesStepHelper';
import useCreateStationContext from '../api/useCreateStationContext';
import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';
import UnitStep from '../components/UnitStep';
import {CreateStationPayload, TimeseriesPayload} from '../controller/types';
import {PathValue, useCreateStationStore} from '../state/store';

type Props = {
  index: string;
  onRemove: () => void;
};

const TimeseriesEditor = ({index, onRemove}: Props) => {
  // const controller = aggregate.getController();
  // const values = controller.getValues();
  const [timeseries, setState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index] as TimeseriesPayload,
    state.setState,
  ]);

  const [showWatlevmp, setShowWatlevmp] = useState(!!timeseries.watlevmp);
  const [showControlSettings, setShowControlSettings] = useState(!!timeseries.control_settings);
  const [showSync, setShowSync] = useState(!!timeseries.sync);
  const [showUnit, setShowUnit] = useState(!!timeseries.unit);

  const tstype_id = timeseries.meta?.tstype_id;

  const {data: dmpAllowedList} = useDMPAllowedList();

  const {isMobile} = useBreakpoints();
  const {meta: metaTmp} = useCreateStationContext();

  const isSyncAllowed = isSynchronizationAllowed(tstype_id, metaTmp?.loctype_id, dmpAllowedList);

  // useEffect(() => {
  //   const unsub = controller.onSliceChange((id, slice) => {
  //     if (id === 'meta') {
  //       const meta = slice?.value as TimeseriesMeta;
  //       setTstype(meta?.tstype_id);
  //       if (meta?.tstype_id !== 1 && showWatlevmp) {
  //         setShowWatlevmp(false);
  //         controller.unregisterSlice('watlevmp');
  //       }

  //       if (!isSyncAllowed && showSync) {
  //         setShowSync(false);
  //         controller.unregisterSlice('sync');
  //       }
  //     }
  //   });

  //   return () => {
  //     unsub();
  //   };
  // }, [controller]);

  return (
    <>
      <TimeseriesMetaForm
        index={index}
        // onValidChange={(isValid, value) => controller.updateSlice('meta', isValid, value)}
        // controller={controller}
      />

      {/* {tstype && (
        <UnitStep
          tstype_id={tstype}
          show={showUnit}
          setShow={setShowUnit}
          controller={controller}
        />
      )}

      <ControlSettingSection
        show={showControlSettings}
        setShow={setShowControlSettings}
        controller={controller}
      /> */}

      {tstype_id === 1 && (
        <WatlevmpSection
          index={index}
          show={showWatlevmp}
          setShow={setShowWatlevmp}
          setValues={(vals) => setState(`timeseries.${index}.watlevmp`, vals)}
        />
      )}

      {/* {isSyncAllowed && (
        <SyncSection show={showSync} setShow={setShowSync} controller={controller} />
      )} */}

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
