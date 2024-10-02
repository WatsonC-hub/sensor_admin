import {zodResolver} from '@hookform/resolvers/zod';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';
import {Controller, FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {useParams} from 'react-router-dom';
import * as z from 'zod';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import {QaAlgorithmParameters, QaAlgorithms, QaAlgorithmsPut} from '~/types';

interface AlgorithCardProps {
  qaAlgorithm: QaAlgorithms;
}

const AlgorithmCard = ({qaAlgorithm}: AlgorithCardProps) => {
  const params = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  console.log(qaAlgorithm);

  const {put: submitData, revert: revertToDefaults} = useAlgorithms(params.ts_id);

  const handleRevert = () => {
    setDeleteDialogOpen(true);
  };

  const submit: SubmitHandler<QaAlgorithmsPut> = (data) => {
    const payload = {
      path: `${params.ts_id}`,
      data: {
        algorithm: qaAlgorithm.algorithm,
        parameters: data.parameters,
        disabled: data.disabled,
      },
    };
    submitData.mutate(payload);
  };

  const handleOkDelete = () => {
    const payload = {
      path: `${params.ts_id}/${qaAlgorithm.algorithm}`,
      data: {algorithm: qaAlgorithm.algorithm},
    };
    revertToDefaults.mutate(payload);
  };

  // const schema = useMemo(() => {
  //   // const schema = z.object({
  //   //   parameter: z.union([z.string(), z.number(), z.boolean()]),
  //   // });
  //   let schema = z.object({
  //     parameters: z.record(z.string(), z.any()),
  //   });

  //   qaAlgorithm?.parameters?.forEach((option: QaAlgorithmParameters) => {
  //     if (option.type === 'number') {
  //       schema.shape.parameters = z.record(
  //         z.string(),
  //         z
  //           .number()
  //           .min(option.min, {message: `Skal være større end ${option.min}`})
  //           .max(option.max, {message: `Skal være mindre end ${option.max}`})
  //       );
  //     } else if (option.type === 'string') {
  //       schema = z.string();
  //     } else if (option.type === 'boolean') {
  //       schema = z.boolean();
  //     }
  //     console.log(option);
  //   });

  //   console.log(schema);

  //   return schema;
  // }, [qaAlgorithm]);
  const schema = useMemo(() => {
    const schema = z.object({
      disabled: z.boolean(),
      parameters: z.object({}),
    });

    qaAlgorithm?.parameters?.forEach((option) => {
      if (option.type === 'number') {
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = z
          .number()
          .min(option.min, {message: `Skal være større end ${option.min}`})
          .max(option.max, {message: `Skal være mindre end ${option.max}`});
      } else if (option.type === 'string') {
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = z.string();
      } else if (option.type === 'boolean') {
        //@ts-expect-error zod types are not correct
        schema.shape.parameters.shape[option.name] = z.boolean();
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
      <Card
        sx={{
          justifyContent: 'center',
          alignContent: 'center',
          borderRadius: 2,
          border: 2,
          borderColor: 'secondary.main',
          minWidth: 200,
          m: 1,
        }}
      >
        <CardHeader title={qaAlgorithm.name} sx={{}} />
        <CardContent
          sx={{
            p: 1,
            m: 0,
          }}
        >
          <FormProvider {...formMethods}>
            {qaAlgorithm?.parameters?.map((option: QaAlgorithmParameters) => {
              return (
                <FormInput
                  key={option.name}
                  fullWidth
                  type={option.type}
                  label={option.label}
                  name={`parameters.${option.name}`}
                />
              );
            })}
            <FormControlLabel
              control={
                <Controller
                  control={formMethods.control}
                  name="disabled"
                  render={({field: {value, ...field}}) => <Checkbox {...field} checked={!!value} />}
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
            />
          </FormProvider>
        </CardContent>
        <CardActions sx={{justifyContent: 'center', alignContent: 'center', p: 1, m: 0}}>
          <Button bttype="tertiary" onClick={handleRevert}>
            Tilbage til standard
          </Button>
          <Button
            bttype="primary"
            onClick={handleSubmit(submit)}
            disabled={
              submitData.isPending || revertToDefaults.isPending || !formMethods.formState.isDirty
            }
          >
            Gem
          </Button>
        </CardActions>
      </Card>
    </>
  );
};

export default AlgorithmCard;
