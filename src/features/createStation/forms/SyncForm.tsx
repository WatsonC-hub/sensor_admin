import {Box} from '@mui/material';
import React, {useEffect} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import useSyncForm from '~/features/synchronization/api/useSyncForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {z} from 'zod';

type SyncFormProps = {
  id: string;
  mode: 'add' | 'edit' | 'mass_edit';
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormSchema | undefined;
  setValues: (values: SyncFormSchema) => void;
};

const syncSchema = z.object({
  owner_cvr: z.number().optional(),
  owner_name: z.union([z.string(), z.literal('')]).optional(),
  jupiter: z.boolean().optional(),
});

type SyncFormSchema = z.infer<typeof syncSchema>;

export type SyncFormData = SyncFormSchema & {
  sync_dmp: boolean;
};

const Form = createTypedForm<SyncFormSchema>();

const SyncForm = ({id, mode, loctype_id, tstype_id, values, setValues}: SyncFormProps) => {
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm<SyncFormSchema>({
    mode: mode,
    context: {
      loctype_id,
      tstype_id,
    },
    values: values,
    schema: syncSchema,
  });

  const {setValue, handleSubmit} = syncFormMethods;

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  return (
    <>
      {(canSyncJupiter || isDmpAllowed) && (
        <Form formMethods={syncFormMethods} gridSizes={12}>
          {canSyncJupiter && (
            <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til Jupiter">
              <Form.Checkbox name="jupiter" label="Jupiter" />
            </TooltipWrapper>
          )}
          {isDmpAllowed && (
            <Box>
              <Form.Input
                select
                name="owner_cvr"
                label="Data ejer"
                required
                placeholder="Vælg data ejer"
                options={owners?.map((owner) => ({
                  [owner.cvr]: owner.name + ` (${owner.cvr})`,
                }))}
                onChangeCallback={(value) => {
                  const owner_cvr = (
                    value as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                  ).target.value;
                  const owner = owners?.find((owner) => owner.cvr === owner_cvr);
                  if (owner) {
                    setValue('owner_cvr', parseInt(owner.cvr));
                    setValue('owner_name', owner.name);
                  }
                }}
              />
            </Box>
          )}
        </Form>
      )}
    </>
  );
};

export default SyncForm;
