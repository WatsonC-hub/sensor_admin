import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {
  Box,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';
import {Controller, FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import GenericCard from '~/components/GenericCard';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import {useRunQA} from '~/hooks/useRunQA';
import {useAppContext} from '~/state/contexts';
import {QaAlgorithmParameters, QaAlgorithms, QaAlgorithmsPut} from '~/types';

interface AlgorithCardProps {
  qaAlgorithm: QaAlgorithms;
}

const AlgorithmCard = ({qaAlgorithm}: AlgorithCardProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const {mutation: rerunQAMutation} = useRunQA(ts_id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {put: submitData, revert: revertToDefaults} = useAlgorithms();

  const handleRevert = () => {
    setDeleteDialogOpen(true);
  };

  const submit: SubmitHandler<QaAlgorithmsPut> = (data) => {
    const payload = {
      path: `${ts_id}`,
      data: {
        algorithm: qaAlgorithm.algorithm,
        parameters: data.parameters,
        disabled: data.disabled,
      },
    };
    submitData.mutate(payload, {
      onSuccess: () => {
        if (qaAlgorithm.runs_as_qa_algorithm) {
          rerunQAMutation.mutate();
        }
      },
    });
  };

  const handleOkDelete = () => {
    const payload = {
      path: `${ts_id}/${qaAlgorithm.algorithm}`,
      data: {algorithm: qaAlgorithm.algorithm},
    };
    revertToDefaults.mutate(payload, {
      onSuccess: () => {
        if (qaAlgorithm.runs_as_qa_algorithm) {
          rerunQAMutation.mutate();
        }
      },
    });
  };

  const schema = useMemo(() => {
    const schema = z.object({
      disabled: z.boolean(),
      parameters: z.object({}),
    });

    qaAlgorithm?.parameters?.forEach((option) => {
      if (option.type === 'number') {
        let zodValue = z.number();

        if (option.min !== undefined) {
          zodValue = zodValue.min(option.min, {message: `Skal være større end ${option.min}`});
        }

        if (option.max !== undefined) {
          zodValue = zodValue.max(option.max, {message: `Skal være mindre end ${option.max}`});
        }

        if (option.nullable == true) {
          //@ts-expect-error zod types are not correct
          zodValue = zodValue.nullable();
        }
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = zodValue;
      } else if (option.type === 'string') {
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = z.string();
      } else if (option.type === 'boolean') {
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = z.boolean();
      } else if (option.type === 'select') {
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = z.string().default('latest_measurement');
      }
    });

    return schema;
  }, [qaAlgorithm]);

  let defaultValues;
  const schemaData =
    schema &&
    schema.safeParse({
      disabled: qaAlgorithm.disabled,
      parameters: qaAlgorithm.parameter_values,
    });
  if (schemaData.success) defaultValues = schemaData.data;

  const formMethods = useForm<QaAlgorithmsPut>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const {reset, handleSubmit} = formMethods;

  useEffect(() => {
    const schemaData =
      schema &&
      schema.safeParse({
        disabled: qaAlgorithm.disabled,
        parameters: qaAlgorithm.parameter_values,
      });
    if (schemaData.success) reset(schemaData.data);
  }, [qaAlgorithm, reset, schema]);

  return (
    <>
      <DeleteAlert
        title="Nulstil algoritme"
        dialogOpen={deleteDialogOpen}
        setDialogOpen={setDeleteDialogOpen}
        onOkDelete={handleOkDelete}
      />
      <GenericCard
        id={qaAlgorithm.name ?? ''}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 4,
          height: '96%',
          minWidth: 350,
          m: 1,
        }}
      >
        <CardHeader
          title={
            <Box>
              <Box
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Typography variant={'h5'}>{qaAlgorithm.name}</Typography>
                <FormControlLabel
                  control={
                    <Controller
                      control={formMethods.control}
                      name="disabled"
                      render={({field: {value, ...field}}) => (
                        <Checkbox {...field} checked={!!value} />
                      )}
                    />
                  }
                  label={
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      Deaktiveret
                    </Typography>
                  }
                  sx={{
                    m: 0,
                  }}
                />
              </Box>
              <Typography fontSize={13} variant="body2">
                {qaAlgorithm.description}
              </Typography>
            </Box>
          }
          sx={{p: 1}}
        />
        <CardContent
          sx={{
            p: 1,
            m: 0,
            marginBottom: 'auto',
          }}
        >
          <FormProvider {...formMethods}>
            {qaAlgorithm?.parameters?.map((option: QaAlgorithmParameters) => {
              return (
                <div key={option.name}>
                  {option.type !== 'select' ? (
                    <FormInput
                      fullWidth
                      type={option.type}
                      label={option.label}
                      name={`parameters.${option.name}`}
                    />
                  ) : (
                    <FormInput
                      fullWidth
                      select
                      label={option.label}
                      options={option.options?.map((opt) => ({[opt.value]: opt.label}))}
                      name={`parameters.${option.name}`}
                    />
                  )}
                </div>
              );
            })}
          </FormProvider>
        </CardContent>
        <CardActions sx={{justifyContent: 'center', marginTop: 'auto', p: 1, m: 0}}>
          <Button bttype="tertiary" onClick={handleRevert}>
            Tilbage til standard
          </Button>
          <Button
            bttype="primary"
            onClick={handleSubmit(submit)}
            startIcon={<Save />}
            disabled={
              submitData.isPending || revertToDefaults.isPending || !formMethods.formState.isDirty
            }
          >
            Gem
          </Button>
        </CardActions>
      </GenericCard>
    </>
  );
};

export default AlgorithmCard;
