import {zodResolver} from '@hookform/resolvers/zod';
import {Card, CardActions, CardContent, CardHeader} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
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

  const queryClient = useQueryClient();
  const {put: submitData, revert: revertToDefaults} = useAlgorithms();

  // const submitData = useMutation({
  //   mutationFn: async (data: QaAlgorithmsPut) => {
  //     const {data: response} = await apiClient.put<QaAlgorithmsPut>(
  //       `/sensor_admin/algorithms/${params.ts_id}`,
  //       data
  //     );
  //     return response;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['algorithms', params.ts_id],
  //     });
  //   },
  // });

  // const revertToDefaults = useMutation({
  //   mutationFn: async () => {
  //     const {data: response} = await apiClient.delete(
  //       `/sensor_admin/algorithms/${params.ts_id}/${qaAlgorithm.algorithm}`
  //     );
  //     return response;
  //   },
  // });

  const handleRevert = () => {
    setDeleteDialogOpen(true);
  };

  const submit: SubmitHandler<QaAlgorithmsPut> = (data) => {
    const payload = {
      path: `${params.ts_id}`,
      data: {
        algorithm: qaAlgorithm.algorithm,
        parameters: data,
      },
    };
    toast.promise(() => submitData.mutateAsync(payload), {
      pending: 'Gemmer indstillinger',
      success: 'Indstillinger gemt',
      error: 'Der skete en fejl',
    });
  };

  const handleOkDelete = () => {
    const payload = {
      path: `${params.ts_id}`,
      data: {algorithm: qaAlgorithm.algorithm},
    };
    toast.promise(
      () =>
        revertToDefaults.mutateAsync(payload, {
          onSuccess: () => {
            console.log(['algorithms', params.ts_id]);
            queryClient.invalidateQueries({
              queryKey: ['algorithms', params.ts_id],
            });
          },
        }),
      {
        pending: 'Nulstiller indstillinger',
        success: 'Indstillinger nulstillet',
        error: 'Der skete en fejl',
      }
    );
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
    const schema = z.object({});

    qaAlgorithm?.parameters?.forEach((option) => {
      if (option.type === 'number') {
        schema.shape[option.name] = z
          .number()
          .min(option.min, {message: `Skal være større end ${option.min}`})
          .max(option.max, {message: `Skal være mindre end ${option.max}`});
      } else if (option.type === 'string') {
        schema.shape[option.name] = z.string();
      } else if (option.type === 'boolean') {
        schema.shape[option.name] = z.boolean();
      }
    });

    return schema;
  }, [qaAlgorithm]);

  let defaultValues;
  const schemaData = schema && schema.safeParse(qaAlgorithm.parameter_values);

  if (schemaData.success) defaultValues = schemaData.data;
  const formMethods = useForm<QaAlgorithmsPut>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const {reset, handleSubmit} = formMethods;

  useEffect(() => {
    if (schemaData.success) reset(schemaData.data);
  }, [qaAlgorithm]);

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
                  name={option.name}
                />
              );
            })}
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
