import {Alert} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {Configuration} from '~/features/station/api/useTimeseriesMeasureSampleSend';

type Props = {
  status: Configuration['configState'];
  handleResend: () => void;
};

const ConfigAlert = ({status, handleResend}: Props) => {
  switch (status) {
    case 'inSync':
      return <Alert severity="success">Tidsseriens konfiguration er i sync med enheden.</Alert>;
    case 'pending':
      return (
        <Alert severity="warning">
          Tidsseriens konfiguration afventer at blive opsamlet af udstyret.
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
    default:
      return null;
  }
};

export default ConfigAlert;
