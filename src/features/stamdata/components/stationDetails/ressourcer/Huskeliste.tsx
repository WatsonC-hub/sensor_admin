import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import Autocomplete from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import TransferList from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';
import {ressourcer} from '~/features/stamdata/components/stationDetails/zodSchemas';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';

const Huskeliste = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {
    relation: {data: related},
  } = useRessourcer(loc_id);

  const schema = ressourcer;
  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ressourcer: related,
    },
    mode: 'onSubmit',
  });

  const {control} = formMethods;

  const {isMobile} = useBreakpoints();
  return (
    <FormProvider {...formMethods}>
      <Controller
        key={'ressourcer'}
        name="ressourcer"
        control={control}
        render={
          !isMobile
            ? ({field: {onChange, value}}) => (
                <TransferList value={value ?? []} setValue={onChange} loc_id={loc_id} />
              )
            : ({field: {onChange, value}}) => (
                <Autocomplete value={value ?? []} setValue={onChange} loc_id={loc_id} />
              )
        }
      />
    </FormProvider>
  );
};

export default Huskeliste;
