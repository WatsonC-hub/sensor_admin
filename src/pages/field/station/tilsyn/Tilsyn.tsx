import {Box} from '@mui/material';
// import {useMutation, useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {useCreateOrUpdateTilsyn} from '~/features/tilsyn/api/createOrUpdateTilsyn';
import {useDeleteTilsyn} from '~/features/tilsyn/api/deleteTilsyn';
import TilsynForm from '~/features/tilsyn/components/TilsynForm';
import TilsynTable from '~/features/tilsyn/components/TilsynTable';
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
    // resolver: zodResolver(tilsynMetadata),
    defaultValues: {
      ...initialData,
    },
  });

  const createTilsynMutation = useCreateOrUpdateTilsyn(ts_id, {
    mutationConfig: {
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
        toast.error('Der skete en fejl');
      },
    },
  });

  const deleteTilsynMutation = useDeleteTilsyn(ts_id, {
    mutationConfig: {
      onSuccess: () => {
        toast.success('Tilsyn slettet');
      },
    },
  });

  const handleServiceSubmit = (values: TilsynItem) => {
    const tilsyn = {...values, user_id: sessionStorage.getItem('user')};
    createTilsynMutation.mutate({ts_id, data: tilsyn});
  };

  const handleEdit = (data: TilsynItem) => {
    console.log(data);
    formMethods.reset(data, {keepDirty: true});
    setShowForm(true);
  };

  const handleDelete = (gid: number | undefined) => {
    deleteTilsynMutation.mutate({ts_id, gid});
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
            handleServiceSubmit={handleServiceSubmit}
            cancel={() => {
              resetFormData();
            }}
            formMethods={formMethods}
          />
        )}
        <TilsynTable
          ts_id={ts_id}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          canEdit={canEdit}
        />
      </Box>
    </FormProvider>
  );
}
