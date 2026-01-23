import React, {useState} from 'react';
import TimeseriesMetaForm from '../forms/TimeseriesMetaForm';
import WatlevmpSection from '../components/WatlevmpSection';
import {Delete} from '@mui/icons-material';
import {Grid2} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import ControlSettingSection from '../components/ControlSettingSection';
import {TimeseriesAggregate} from '../controller/TimeseriesAggregate';

type Props = {
  aggregate: TimeseriesAggregate;
  onRemove: () => void;
};

const TimeseriesEditor = ({aggregate, onRemove}: Props) => {
  const [showWatlevmp, setShowWatlevmp] = useState(false);
  const [showControlSettings, setShowControlSettings] = useState(false);
  const {isMobile} = useBreakpoints();
  const controller = aggregate.getController();

  return (
    <>
      <TimeseriesMetaForm
        onValidChange={(isValid, value) => controller.updateSlice('meta', isValid, value)}
        controller={controller}
      />

      {controller.getSlices()['meta']?.value?.tstype_id === 1 && (
        <WatlevmpSection show={showWatlevmp} setShow={setShowWatlevmp} controller={controller} />
      )}

      <ControlSettingSection
        show={showControlSettings}
        setShow={setShowControlSettings}
        controller={controller}
      />

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
