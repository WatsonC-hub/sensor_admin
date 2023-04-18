import React, {useMemo} from 'react';
import {Card, CardHeader, CardContent, TextField, CardActions, Button} from '@mui/material';
import {useParams} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, FormProvider} from 'react-hook-form';
import FormInput from 'src/components/FormInput';
import * as z from 'zod';

const AlgorithmCard = ({algorithm}) => {
  const params = useParams();

  const submitData = useMutation(async (data) => {
    const {data: response} = await apiClient.put(`/sensor_admin/algorithms/${params.ts_id}`, data);
    return response;
  });

  const handleSubmit = (data) => {
    const payload = {
      algorithm: algorithm.algorithm,
      parameters: data,
    };
    console.log(payload);
    submitData.mutate(payload);
  };

  const schema = useMemo(() => {
    const schema = z.object({});

    algorithm?.parameters?.forEach((option) => {
      console.log(option);
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

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: schema.safeParse(algorithm.parameter_values).data,
  });

  return (
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
        width: 300,
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
              <FormInput fullWidth type={option.type} label={option.label} name={option.name} />
            );
          })}
        </FormProvider>
      </CardContent>
      <CardActions sx={{justifyContent: 'center', alignContent: 'center', p: 1, m: 0}}>
        <Button
          variant="contained"
          color="primary"
          onClick={formMethods.handleSubmit(handleSubmit)}
        >
          Gem
        </Button>
      </CardActions>
    </Card>
  );
};

export default AlgorithmCard;
