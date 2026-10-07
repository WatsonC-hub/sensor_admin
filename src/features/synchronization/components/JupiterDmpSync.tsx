import {Box, Checkbox, FormControlLabel, Grid} from '@mui/material';
import React from 'react';
import {Controller} from 'react-hook-form';

import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import usePermissions from '~/features/permissions/api/usePermissions';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';

import useSyncForm from '../api/useSyncForm';

import type {SyncFormSchema, SyncFormSchemaOutput} from '../api/useSyncForm';

const Form = createTypedForm<SyncFormSchema, SyncFormSchemaOutput>();

type JupiterDmpSyncProps = {
  loctype_id?: number;
  tstype_id?: number;
  values: SyncFormSchema | undefined;
  submit: (data: SyncFormSchema) => void;
  intakeno?: number | null;
  ts_id: number;
};

const JupiterDmpSync = ({
  loctype_id,
  tstype_id,
  values,
  submit,
  intakeno,
  ts_id,
}: JupiterDmpSyncProps) => {
  const {syncFormMethods, isDmpAllowed, canSyncJupiter, owners} = useSyncForm({
    context: {
      loctype_id,
      tstype_id,
    },
    values: values,
  });

  const {
    setValue,
    reset,
    formState: {isDirty},
    control,
    watch,
    trigger,
  } = syncFormMethods;
  const {location_permissions} = usePermissions();

  const disabled = location_permissions !== 'edit' || values?.dmp != null;

  const dmp = watch('dmp');
  const showInput = dmp != undefined && dmp != false;

  return (
    <>
      {(canSyncJupiter || isDmpAllowed) && (
        <Form formMethods={syncFormMethods} gridSizes={12}>
          <Box>
            {canSyncJupiter && (
              <TooltipWrapper
                description={
                  intakeno == null
                    ? 'Indtagsnummer mangler før du kan synkronisere til Jupiter. Indtast det under rediger tidsserie.'
                    : 'Aktiverer synkronisering af denne tidsserie til Jupiter'
                }
              >
                <Form.Checkbox
                  disabled={disabled || intakeno == null}
                  name="jupiter"
                  label="Synkroniser til jupiter"
                />
              </TooltipWrapper>
            )}
            {isDmpAllowed && (
              <Box>
                <TooltipWrapper description="Aktiverer synkronisering af denne tidsserie til Danmarks Miljøportal">
                  <Controller
                    name="dmp"
                    control={control}
                    render={({field: {value, onChange}}) => {
                      return (
                        <FormControlLabel
                          disabled={disabled}
                          control={
                            <Checkbox
                              checked={value != false && value != undefined}
                              sx={{
                                width: 'fit-content',
                              }}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  onChange({});
                                }
                                if (!e.target.checked) {
                                  reset();
                                }
                              }}
                            />
                          }
                          label={'Danmarks Miljøportal'}
                        />
                      );
                    }}
                  />
                </TooltipWrapper>
                {showInput && (
                  <Form.Input
                    select
                    name="dmp.owner_cvr"
                    label="Data ejer"
                    disabled={disabled}
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
                        setValue('dmp.owner_cvr', parseInt(owner.cvr), {
                          shouldDirty: true,
                        });
                        setValue('dmp.owner_name', owner.name, {
                          shouldDirty: true,
                        });
                        trigger('dmp');
                      }
                    }}
                  />
                )}
              </Box>
            )}
          </Box>

          <Grid
            size={12}
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              alignSelf: 'end',
            }}
          >
            <UpdateProgressButton
              progressKey="sync"
              key={ts_id}
              loc_id={-1}
              ts_id={ts_id}
              disabled={disabled || isDirty}
            />
            <Form.Cancel
              cancel={() => {
                reset();
                // setDmpActive(false);
              }}
              disabled={disabled || !isDirty}
            />
            <Form.Submit submit={submit} />
          </Grid>
        </Form>
      )}
    </>
  );
};

export default JupiterDmpSync;
