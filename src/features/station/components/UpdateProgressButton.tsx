import {Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {ProgressStatus, useStationProgress} from '~/hooks/query/stationProgress';

type Props = {
  progressKey: keyof ProgressStatus;
  loc_id: number | undefined;
  ts_id?: number;
  disabled?: boolean;
  title?: string;
  alterStyle?: boolean;
};

const UpdateProgressButton = ({progressKey, loc_id, ts_id, disabled, title, alterStyle}: Props) => {
  const {needsProgress, hasAssessed} = useStationProgress(loc_id, progressKey, ts_id);

  return (
    <>
      {needsProgress ? (
        <Button
          bttype="progress"
          onClick={hasAssessed}
          disabled={disabled}
          sx={{...(alterStyle ? {height: 56, borderRadius: 4.5} : {})}}
        >
          {alterStyle ? (
            <Typography>{title || 'Ikke relevant'}</Typography>
          ) : (
            title || 'Ikke relevant'
          )}
        </Button>
      ) : null}
    </>
  );
};
export default UpdateProgressButton;
