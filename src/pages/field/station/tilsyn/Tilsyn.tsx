import {zodResolver} from '@hookform/resolvers/zod';
import {Box} from '@mui/material';
import {useMutation, useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import TilsynForm from '~/components/TilsynForm';
import TilsynTable from '~/components/TilsynTable';
import {tilsynMetadata} from '~/helpers/zodSchemas';
import {queryClient} from '~/queryClient';
import {TilsynItem} from '~/types';

type Props = {
  ts_id: number;
  showForm: boolean;
  setShowForm: (showForm: boolean | null) => void;
  canEdit: boolean;
};

export default function Tilsyn({ts_id, showForm, setShowForm, canEdit}: Props) {
  const initialData: TilsynItem = {
    dato: moment().format('YYYY-MM-DDTHH:mm'),
    gid: -1,
    batteriskift: false,
    kommentar: '',
    tilsyn: false,
  };

  const formMethods = useForm({
    resolver: zodResolver(tilsynMetadata),
    defaultValues: {
      ...initialData,
    },
  });

  const {data: services} = useQuery({
    queryKey: ['service', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/service/${ts_id}`);
      return data;
    },
    select: (data) =>
      data.map((m: TilsynItem) => {
        return {...m, dato: moment(m.dato).format('YYYY-MM-DDTHH:mm')};
      }),
    enabled: ts_id !== -1 && ts_id !== null,
  });

  const serviceMutate = useMutation({
    mutationFn: (data: TilsynItem) => {
      if (data.gid === -1) {
        return apiClient.post(`/sensor_field/station/service/${ts_id}`, data);
      } else {
        return apiClient.put(`/sensor_field/station/service/${ts_id}/${data.gid}`, data);
      }
    },
  });

  const handleServiceSubmit = (values: TilsynItem) => {
    serviceMutate.mutate(
      {...values, user_id: sessionStorage.getItem('user')},
      {
        onSuccess: () => {
          setShowForm(null);
          toast.success('Tilsyn gemt');
          queryClient.invalidateQueries({
            queryKey: ['service', ts_id],
          });
          formMethods.reset(initialData);
        },
        onError: (error: Error) => {
          console.log(error);
          if (error.response.data.detail.includes('No unit')) {
            toast.error('Der er ingen enhed tilknyttet på denne dato');
          } else {
            toast.error('Der skete en fejl');
          }
        },
      }
    );
  };

  const handleEdit = (data: TilsynItem) => {
    // data.dato = moment.isMoment(data.dato) = data.dato.format() : data.dato
    console.log(data);
    formMethods.reset(data, {keepDirty: true});
    setShowForm(true);
  };

  const handleDelete = (gid: number) => {
    apiClient.delete(`/sensor_field/station/service/${ts_id}/${gid}`).then(() => {
      queryClient.invalidateQueries({
        queryKey: ['service', ts_id],
      });
      toast.success('Tilsyn slettet');
    });
  };

  const resetFormData = () => {
    console.log('values', formMethods.getValues());
    formMethods.reset(initialData);
    setShowForm(null);
  };

  useEffect(() => {
    if (showForm && formMethods.getValues('gid') === -1) formMethods.reset(initialData);
  }, [showForm]);

  return (
    <FormProvider {...formMethods}>
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
        {showForm === true && (
          <TilsynForm
            handleSubmit={formMethods.handleSubmit(handleServiceSubmit, (values) => {
              console.log(formMethods.getValues());
              console.log(values);
            })}
            cancel={() => {
              resetFormData();
            }}
            formMethods={formMethods}
          />
        )}
        <TilsynTable
          services={services}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          canEdit={canEdit}
        />
      </Box>
    </FormProvider>
  );
}
