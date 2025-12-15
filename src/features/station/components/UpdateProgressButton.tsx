import React from 'react';
import Button from '~/components/Button';
import {ProgressStatus, useStationProgress} from '~/hooks/query/stationProgress';

type Props = {
  progressKey: keyof ProgressStatus;
  loc_id: number | undefined;
  ts_id?: number;
  disabled?: boolean;
};

const UpdateProgressButton = ({progressKey, loc_id, ts_id, disabled}: Props) => {
  const {needsProgress, hasAssessed} = useStationProgress(loc_id, progressKey, ts_id);

  console.log({needsProgress, progressKey, loc_id, ts_id});
  return (
    <>
      {needsProgress ? (
        <Button bttype="primary" onClick={hasAssessed} disabled={disabled}>
          Markér håndteret
        </Button>
      ) : null}
    </>
  );
};
export default UpdateProgressButton;
