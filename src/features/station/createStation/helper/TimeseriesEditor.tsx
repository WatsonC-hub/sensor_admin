import React, {useEffect, useState} from 'react';
import TimeseriesMetaForm from '../forms/TimeseriesMetaForm';
import WatlevmpSection from '../components/WatlevmpSection';
import {TimeseriesPayload} from '../controller/types';
import {Delete} from '@mui/icons-material';
import {Grid2} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import ControlSettingSection from '../components/ControlSettingSection';
import {useAggregateController} from '../controller/useAggregateController';

type Props = {
  // onChange: (state: {valid: boolean; value?: TimeseriesPayload}) => void;
  onRegister: (controller: ReturnType<typeof useAggregateController<TimeseriesPayload>>) => void;
  onRemove: () => void;
};

const TimeseriesEditor = ({onRegister, onRemove}: Props) => {
  const [showWatlevmp, setShowWatlevmp] = useState(false);
  const [showControlSettings, setShowControlSettings] = useState(false);
  const {isMobile} = useBreakpoints();
  const ts = useAggregateController<TimeseriesPayload>();

  // useEffect(() => {
  //   ts.publish();
  // }, [ts.isValid]);
  useEffect(() => {
    onRegister(ts);
  }, [ts]);

  return (
    <>
      <TimeseriesMetaForm
        onValidChange={(isValid, value) => ts.updateSlice('meta', isValid, value)}
        controller={ts}
      />

      {ts.getSlices()['meta']?.value?.tstype_id === 1 && (
        <WatlevmpSection show={showWatlevmp} setShow={setShowWatlevmp} controller={ts} />
      )}

      <ControlSettingSection
        show={showControlSettings}
        setShow={setShowControlSettings}
        controller={ts}
      />

      <Grid2
        size={isMobile ? 12 : 1}
        alignContent={'center'}
        display={'flex'}
        width={'100%'}
        justifyContent={'end'}
      >
        <Button bttype="tertiary" startIcon={<Delete />} onClick={() => onRemove()}>
          Fjern tidsserie
        </Button>
      </Grid2>
    </>
  );
};

export default TimeseriesEditor;
