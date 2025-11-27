import React from 'react';
import Button from '~/components/Button';
import {ProgressStatus, useProgress} from '~/hooks/query/stationProgress';

type Props = {
  progressKey: keyof ProgressStatus;
  ts_id: number | undefined;
};

const UpdateProgressButton = ({progressKey, ts_id}: Props) => {
  const {data: progress} = useProgress(ts_id, {
    select: (data) => data[progressKey],
  });

  return <>{progress ? null : <Button bttype="primary">Test</Button>}</>;
};
export default UpdateProgressButton;
