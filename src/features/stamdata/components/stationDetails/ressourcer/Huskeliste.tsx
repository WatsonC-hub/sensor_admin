import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import usePermissions from '~/features/permissions/api/usePermissions';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import Autocomplete from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import TransferList from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';
import useBreakpoints from '~/hooks/useBreakpoints';
import {Ressourcer} from './multiselect/types';
import {z} from 'zod';
import {Box} from '@mui/material';

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

type HuskelisteProps = {
  loc_id?: number;
  onValidate?: (ressourcer: Ressourcer[]) => void;
};

const Huskeliste = ({loc_id, onValidate}: HuskelisteProps) => {
  const {isMobile} = useBreakpoints();
  const {
    relation: {data: related},
  } = useRessourcer();

  const {location_permissions} = usePermissions(loc_id);

  const schema = ressourcer;
  const result = schema.safeParse(related);
  const formMethods = useForm<{ressourcer: Ressourcer[]}>({
    resolver: zodResolver(schema),
    defaultValues: {
      ressourcer: result.success ? result.data : [],
    },
    values: {ressourcer: result.data ?? []},
    mode: 'onSubmit',
  });

  const {control} = formMethods;

  return (
    <FormProvider {...formMethods}>
      <Controller
        key={'ressourcer'}
        name="ressourcer"
        control={control}
        disabled={location_permissions !== 'edit'}
        render={({field: {onChange, value}}) => {
          return (
            <Box display={'flex'} flexGrow={1} minWidth={275} maxWidth={1080}>
              {!isMobile ? (
                <TransferList
                  loc_id={loc_id}
                  value={value ?? []}
                  setValue={loc_id === undefined && onValidate ? onValidate : onChange}
                />
              ) : (
                <Autocomplete
                  loc_id={loc_id}
                  value={value ?? []}
                  setValue={loc_id === undefined && onValidate ? onValidate : onChange}
                />
              )}
            </Box>
          );
        }}
      />
    </FormProvider>
  );
};

export default Huskeliste;
