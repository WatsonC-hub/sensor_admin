import React from 'react';
import Button from '~/components/Button';
import {ProgressStatus, useStationProgress} from '~/hooks/query/stationProgress';

type Props = {
  progressKey: keyof ProgressStatus;
  loc_id: number | undefined;
  ts_id?: number;
  disabled?: boolean;
  title?: string;
};

const UpdateProgressButton = ({progressKey, loc_id, ts_id, disabled, title}: Props) => {
  const {needsProgress, hasAssessed} = useStationProgress(loc_id, progressKey, ts_id);

  return (
    <>
      {needsProgress ? (
        <Button bttype="progress" onClick={hasAssessed} disabled={disabled}>
          {title || 'Ikke relevant'}
        </Button>
      ) : null}
    </>
  );
};
export default UpdateProgressButton;
