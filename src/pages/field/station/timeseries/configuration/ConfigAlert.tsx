import {Alert} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {Configuration} from '~/features/station/api/useTimeseriesMeasureSampleSend';

type Props = {
  status: Configuration['configState'];
  timeseriesStatus: Configuration['currentPendingTimeseries'];
  handleResend: () => void;
};

const ConfigAlert = ({status, timeseriesStatus, handleResend}: Props) => {
  switch (status) {
    case 'inSync':
      return <Alert severity="success">Tidsseriens konfiguration er i synk med enheden.</Alert>;
    case 'pending':
      return (
        <Alert severity="warning">
          {timeseriesStatus === null ? (
            <span>
              Seneste gemte konfiguration for denne tidsserie afventer at blive opsamlet af
              udstyret.
            </span>
          ) : (
            <span>
              Seneste konfiguration fra <i>{timeseriesStatus}</i> afventer at blive opsamlet af
              udstyret.
            </span>
          )}
        </Alert>
      );
    case 'failed':
      return (
        <Alert severity="error">
          Tidsseriens konfiguration er ikke opsamlet af udstyret. Vil du gensende konfigurationen?{' '}
          <Button bttype="link" onClick={handleResend}>
            Gensend
          </Button>
        </Alert>
      );
    case 'outOfSync':
      return (
        <Alert severity="error">
          Tidsserien er ude af synk med udstyret. Dette kan være fordi enheden er konfigureret andet
          sted fra. Vil du gensende konfigurationen?
          <Button bttype="link" onClick={handleResend}>
            Gensend
          </Button>
        </Alert>
      );
    default:
      return null;
  }
};

export default ConfigAlert;
