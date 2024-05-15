import {zodResolver} from '@hookform/resolvers/zod';
import {Card, CardActions, CardContent, CardHeader} from '@mui/material';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useMemo, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import * as z from 'zod';
import Button from '~/components/Button';

const AlgorithmCard = ({algorithm}) => {
  const params = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const submitData = useMutation({
    mutationFn: async (data) => {
      const {data: response} = await apiClient.put(
        `/sensor_admin/algorithms/${params.ts_id}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['algorithms', params.ts_id],
      });
    },
  });

  const revertToDefaults = useMutation({
    mutationFn: async (data) => {
      const {data: response} = await apiClient.delete(
        `/sensor_admin/algorithms/${params.ts_id}/${algorithm.algorithm}`
      );
      return response;
    },
  });

  const handleRevert = () => {
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (data) => {
    const payload = {
      algorithm: algorithm.algorithm,
      parameters: data,
    };
    toast.promise(() => submitData.mutateAsync(payload), {
      pending: 'Gemmer indstillinger',
      success: 'Indstillinger gemt',
      error: 'Der skete en fejl',
    });
  };

  const handleOkDelete = () => {
    toast.promise(
      () =>
        revertToDefaults.mutateAsync(
          {algorithm: algorithm.algorithm},
          {
            onSuccess: () => {
              console.log(['algorithms', params.ts_id]);
              queryClient.invalidateQueries({
                queryKey: ['algorithms', params.ts_id],
              });
            },
          }
        ),
      {
        pending: 'Nulstiller indstillinger',
        success: 'Indstillinger nulstillet',
        error: 'Der skete en fejl',
      }
    );
  };

  const schema = useMemo(() => {
    const schema = z.object({});

    algorithm?.parameters?.forEach((option) => {
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
  }, [algorithm]);

  useEffect(() => {
    formMethods.reset(schema.safeParse(algorithm.parameter_values).data);
  }, [algorithm]);

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: schema.safeParse(algorithm.parameter_values).data,
  });

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
          // textAlign: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          borderRadius: 2,
          border: 2,
          borderColor: 'secondary.main',
          // backgroundColor: 'primary.light',
          // color: 'primary.contrastText',
          minWidth: 200,
          // maxWidth: 300,
          m: 1,
        }}
      >
        <CardHeader title={algorithm.name} sx={{}} />
        <CardContent
          sx={{
            p: 1,
            m: 0,
          }}
        >
          <FormProvider {...formMethods}>
            {algorithm?.parameters?.map((option) => {
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
          <Button btType="tertiary" onClick={handleRevert}>
            Tilbage til standard
          </Button>
          <Button
            btType="secondary"
            onClick={formMethods.handleSubmit(handleSubmit)}
            disabled={
              submitData.isLoading || revertToDefaults.isLoading || !formMethods.formState.isDirty
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
