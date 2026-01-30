import React, {useEffect} from 'react';
import CheckboxesTags from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/Autocomplete';
import TranserList from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/TransferList';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';
import {Controller, FormProvider, useForm} from 'react-hook-form';

const ressourceSchema = z.object({
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
          .transform((a) => a ?? []),
        loctype_id: z
          .number()
          .array()
          .nullable()
          .transform((a) => a ?? []),
        forudvalgt: z.boolean(),
      })
    )
    .nullish()
    .transform((r) => r ?? []),
});

const RessourceForm = () => {
  const {isMobile} = useBreakpoints();
  const id = 'location.ressourcer';
  const [ressourcer, setState, registerSubmitter, removeSubmitter] = useCreateStationStore(
    (state) => [
      state.formState.location?.ressourcer,
      state.setState,
      state.registerSubmitter,
      state.removeSubmitter,
    ]
  );

  const formMethods = useForm<{ressourcer: Ressourcer[]}>({
    resolver: zodResolver(ressourceSchema),
    defaultValues: {
      ressourcer: ressourcer,
    },
    mode: 'onTouched',
  });

  const {control, handleSubmit} = formMethods;

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setState('location.ressourcer', values.ressourcer);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  return (
    <FormProvider {...formMethods}>
      <Controller
        key={'ressourcer'}
        name="ressourcer"
        control={control}
        render={({field: {onChange, value}}) => {
          return (
            <>
              {!isMobile ? (
                <TranserList
                  loc_id={undefined}
                  value={value}
                  setValue={(ressourcer) => onChange(ressourcer)}
                />
              ) : (
                <CheckboxesTags
                  loc_id={undefined}
                  value={value}
                  setValue={(ressourcer) => onChange(ressourcer)}
                />
              )}
            </>
          );
        }}
      />
    </FormProvider>
  );
};

export default RessourceForm;
