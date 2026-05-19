import React from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';
import SyncForm from '../forms/SyncForm';

type Props = {
  uuid: string;
  tstype_id?: number;
};

const SyncSection = ({uuid, tstype_id}: Props) => {
  const [meta, setState, sync] = useCreateStationStore((state) => [
    state.formState.location?.meta,
    state.setState,
    state.formState.timeseries?.[uuid].sync,
  ]);

  const id = `timeseries.${uuid}.sync`;

  return (
    <FormFieldset label="Synkronisering" sx={{width: '100%', p: 1}}>
      <SyncForm
        loctype_id={meta?.loctype_id}
        tstype_id={tstype_id ?? undefined}
        id={id}
        values={sync}
        setValues={(values) => setState(`timeseries.${uuid}.sync`, values)}
      />
    </FormFieldset>
  );
};

export default SyncSection;
