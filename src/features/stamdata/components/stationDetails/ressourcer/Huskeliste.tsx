import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import Autocomplete from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import TransferList from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';
import {ressourcer} from '~/features/stamdata/components/stationDetails/zodSchemas';
import useBreakpoints from '~/hooks/useBreakpoints';
import LoadingSkeleton from '~/LoadingSkeleton';

const Huskeliste = () => {
  const {isMobile} = useBreakpoints();
  const {
    relation: {data: related, isPending},
  } = useRessourcer();

  const schema = ressourcer;
  const result = schema.safeParse(related);
  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ressourcer: result.success ? result.data : [],
    },
    mode: 'onSubmit',
  });

  if (isPending) return <LoadingSkeleton />;

  const {control} = formMethods;

  return (
    <FormProvider {...formMethods}>
      <Controller
        key={'ressourcer'}
        name="ressourcer"
        control={control}
        render={
          !isMobile
            ? ({field: {onChange, value}}) => (
                <TransferList value={value ?? []} setValue={onChange} />
              )
            : ({field: {onChange, value}}) => (
                <Autocomplete value={value ?? []} setValue={onChange} />
              )
        }
      />
    </FormProvider>
  );
};

export default Huskeliste;
