import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import usePermissions from '~/features/permissions/api/usePermissions';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import Autocomplete from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import TransferList from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {Ressourcer} from './multiselect/types';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {z} from 'zod';

const ressourcer = z
  .array(
    z.object({
      id: z.number(),
      navn: z.string(),
      kategori: z.string(),
      tstype_id: z
        .number()
        .array()
        .nullable()
        .transform((array) => array ?? []),
      loctype_id: z
        .number()
        .array()
        .nullable()
        .transform((array) => array ?? []),
      forudvalgt: z.boolean(),
    })
  )
  .nullish()
  .transform((ressourcer) => ressourcer ?? []);

const Huskeliste = () => {
  const {isMobile} = useBreakpoints();
  const {
    relation: {data: related},
  } = useRessourcer();

  const {loc_id} = useAppContext(['loc_id']);
  const {location_permissions} = usePermissions(loc_id);

  const schema = ressourcer;
  const result = schema.safeParse(related);
  const formMethods = useForm<{ressourcer: Ressourcer[]}>({
    resolver: zodResolver(schema),
    defaultValues: {
      ressourcer: result.success ? result.data : [],
    },
    mode: 'onSubmit',
  });

  const {control} = formMethods;

  return (
    <StationPageBoxLayout>
      <FormProvider {...formMethods}>
        <Controller
          key={'ressourcer'}
          name="ressourcer"
          control={control}
          disabled={location_permissions !== 'edit'}
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
    </StationPageBoxLayout>
  );
};

export default Huskeliste;
