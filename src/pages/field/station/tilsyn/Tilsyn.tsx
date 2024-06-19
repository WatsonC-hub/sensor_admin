import {Box} from '@mui/material';
import moment from 'moment';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';

import {useTilsyn} from '~/features/tilsyn/api/useTilsyn';
import TilsynForm from '~/features/tilsyn/components/TilsynForm';
import TilsynTable from '~/features/tilsyn/components/TilsynTable';
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
    user_id: null,
  };

  const formMethods = useForm<TilsynItem>({
    defaultValues: {
      ...initialData,
    },
  });

  const {post: postTilsyn, put: putTilsyn, del: delTilsyn} = useTilsyn();

  const handleServiceSubmit = (values: TilsynItem) => {
    const tilsyn = {...values, user_id: sessionStorage.getItem('user')};

    const mutationOptions = {
      onSuccess: () => {
        resetFormData();
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error('Der skete en fejl');
      },
    };

    if (tilsyn.gid === -1) {
      const payload = {
        data: tilsyn,
        path: `${ts_id}`,
      };
      postTilsyn.mutate(payload, mutationOptions);
    } else {
      const payload = {
        data: tilsyn,
        path: `${ts_id}/${tilsyn.gid}`,
      };
      putTilsyn.mutate(payload, mutationOptions);
    }
  };

  const handleEdit = (data: TilsynItem) => {
    formMethods.reset(data, {keepDirty: true});
    setShowForm(true);
  };

  const handleDelete = (gid: number | undefined) => {
    const payload = {
      path: `${ts_id}/${gid}`,
    };
    delTilsyn.mutate(payload, {
      onSuccess: () => {
        resetFormData();
      },
    });
  };

  const resetFormData = () => {
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
          <TilsynForm handleServiceSubmit={handleServiceSubmit} cancel={resetFormData} />
        )}
        <TilsynTable handleEdit={handleEdit} handleDelete={handleDelete} canEdit={canEdit} />
      </Box>
    </FormProvider>
  );
}
