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
import {fetchDmpAllowedMapList} from '../../api/useDmpAllowedMapList';
import UnitStep from '../components/UnitStep';

type Props = {
  aggregate: TimeseriesAggregate;
  onRemove: () => void;
};

const TimeseriesEditor = ({aggregate, onRemove}: Props) => {
  const controller = aggregate.getController();
  const values = controller.getValues();

  const [showWatlevmp, setShowWatlevmp] = useState(!!values.watlevmp);
  const [showControlSettings, setShowControlSettings] = useState(!!values.control_settings);
  const [showSync, setShowSync] = useState(!!values.sync);
  const [showUnit, setShowUnit] = useState(!!values.unit);

  const meta = values.meta;
  const [tstype, setTstype] = React.useState<number | undefined>(meta?.tstype_id);
  const {data: dmpAllowedList} = fetchDmpAllowedMapList();

  const {isMobile} = useBreakpoints();
  const {meta: metaTmp} = useCreateStationContext();

  const isSyncAllowed = isSynchronizationAllowed(
    values.meta?.tstype_id,
    metaTmp?.loctype_id,
    dmpAllowedList
  );

  useEffect(() => {
    const unsub = controller.onSliceChange((id, slice) => {
      if (id === 'meta') {
        const meta = slice?.value as TimeseriesMeta;
        setTstype(meta?.tstype_id);
        if (meta?.tstype_id !== 1 && showWatlevmp) {
          setShowWatlevmp(false);
          controller.unregisterSlice('watlevmp');
        }

        if (!isSyncAllowed && showSync) {
          setShowSync(false);
          controller.unregisterSlice('sync');
        }
      }
    });

    return () => {
      unsub();
    };
  }, [controller]);

  return (
    <>
      <TimeseriesMetaForm
        onValidChange={(isValid, value) => controller.updateSlice('meta', isValid, value)}
        controller={controller}
      />

      {tstype && (
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
      />

      {tstype === 1 && (
        <WatlevmpSection show={showWatlevmp} setShow={setShowWatlevmp} controller={controller} />
      )}

      {isSyncAllowed && (
        <SyncSection show={showSync} setShow={setShowSync} controller={controller} />
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
