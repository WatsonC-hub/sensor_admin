import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import usePermissions from '~/features/permissions/api/usePermissions';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import Autocomplete from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import TransferList from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';
import useBreakpoints from '~/hooks/useBreakpoints';
import {z} from 'zod';
import {Box} from '@mui/material';

const ressourcer = z.object({
  ressourcer: z
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
    .transform((ressourcer) => ressourcer ?? []),
});

type HuskelisteProps = {
  loc_id?: number;
  onValidate?: (ressourcer: RessourceInput) => void;
};

type RessourceInput = z.input<typeof ressourcer.shape.ressourcer>;

const Huskeliste = ({loc_id, onValidate}: HuskelisteProps) => {
  const {isMobile} = useBreakpoints();
  const {
    relation: {data: related},
  } = useRessourcer(loc_id);

  const {location_permissions} = usePermissions(loc_id);

  const result = ressourcer.safeParse(related);
  const formMethods = useForm<z.input<typeof ressourcer>>({
    resolver: zodResolver(ressourcer),
    defaultValues: result.data,
    values: result.data,
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
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                minWidth: 275,
                maxWidth: 1080,
              }}
            >
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
