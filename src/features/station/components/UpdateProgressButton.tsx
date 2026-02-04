import {Check, PriorityHigh} from '@mui/icons-material';
import {Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {useUser} from '~/features/auth/useUser';
import {ProgressStatus, useStationProgress} from '~/hooks/query/stationProgress';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  progressKey: keyof ProgressStatus;
  loc_id: number | undefined;
  ts_id?: number;
  disabled?: boolean;
  alterStyle?: boolean;
};

const UpdateProgressButton = ({progressKey, loc_id, ts_id, disabled, alterStyle}: Props) => {
  const {
    features: {stationProgress},
  } = useUser();
  const {needsProgress, hasAssessed} = useStationProgress(loc_id, progressKey, ts_id);
  const {isMobile} = useBreakpoints();

  return (
    <>
      {needsProgress && stationProgress ? (
        <Button
          bttype="progress"
          onClick={hasAssessed}
          disabled={disabled}
          startIcon={<PriorityHigh />}
          sx={{
            ...(alterStyle ? {height: 56, borderRadius: 4.5} : {}),
            alignContent: 'center',
          }}
        >
          {isMobile ? (
            <Check />
          ) : alterStyle ? (
            <Typography component="span">{'Godkend indstilling'}</Typography>
          ) : (
            <Typography component="span" variant="body2">
              Godkend indstilling
            </Typography>
          )}
        </Button>
      ) : null}
    </>
  );
};
export default UpdateProgressButton;
