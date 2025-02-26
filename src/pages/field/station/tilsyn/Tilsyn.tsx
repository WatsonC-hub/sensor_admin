import {PlaylistAddRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import moment from 'moment';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useTilsyn} from '~/features/tilsyn/api/useTilsyn';
import TilsynForm from '~/features/tilsyn/components/TilsynForm';
import TilsynTable from '~/features/tilsyn/components/TilsynTable';
import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
import {TilsynItem} from '~/types';

export default function Tilsyn() {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const [showForm, setShowForm] = useShowFormState();
  const {isTouch, isLaptop} = useBreakpoints();
  const initialData: TilsynItem = {
    dato: moment().format('YYYY-MM-DDTHH:mm'),
    gid: -1,
    batteriskift: false,
    kommentar: '',
    tilsyn: false,
    user_id: null,
  };

  const {
    feature_permission_query: {data: permissions},
  } = usePermissions(loc_id);

  const formMethods = useForm<TilsynItem>({defaultValues: initialData});

  const {reset, getValues} = formMethods;

  const {post: postTilsyn, put: putTilsyn, del: delTilsyn} = useTilsyn();

  const handleServiceSubmit = (values: TilsynItem) => {
    const tilsyn = {...values, dato: moment(values.dato).toISOString()};

    const mutationOptions = {
      onSuccess: () => {
        resetFormData();
      },
    };

    if (tilsyn.gid === -1) {
      const payload = {data: tilsyn, path: `${ts_id}`};
      postTilsyn.mutate(payload, mutationOptions);
    } else {
      const payload = {data: tilsyn, path: `${ts_id}/${tilsyn.gid}`};
      putTilsyn.mutate(payload, mutationOptions);
    }
  };

  const handleEdit = (data: TilsynItem) => {
    reset(data, {keepDirty: true});
    setShowForm(true);
  };

  const handleDelete = (gid: number | undefined) => {
    const payload = {path: `${ts_id}/${gid}`};
    delTilsyn.mutate(payload, {
      onSuccess: () => {
        resetFormData();
      },
    });
  };

  const resetFormData = () => {
    reset(initialData);
    setShowForm(null);
  };

  useEffect(() => {
    if (showForm && getValues('gid') === -1) {
      reset(initialData);
    }
  }, [showForm]);

  useEffect(() => {
    setShowForm(null);
    reset(initialData);
  }, [ts_id]);

  return (
    <Box>
      <FormProvider {...formMethods}>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
          {showForm === true && (
            <TilsynForm handleServiceSubmit={handleServiceSubmit} cancel={resetFormData} />
          )}
        </Box>
      </FormProvider>
      <Box display={'flex'} flexDirection={'column'} gap={isTouch || isLaptop ? 8 : undefined}>
        <TilsynTable
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          disabled={permissions?.[ts_id] !== 'edit'}
        />
        <FabWrapper
          icon={<PlaylistAddRounded />}
          text={'Tilføj ' + stationPages.TILSYN}
          onClick={() => {
            setShowForm(true);
          }}
          disabled={permissions?.[ts_id] !== 'edit'}
          sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
        />
      </Box>
    </Box>
  );
}
