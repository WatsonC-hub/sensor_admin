import {zodResolver} from '@hookform/resolvers/zod';
import {PlaylistAddRounded} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

import FabWrapper from '~/components/FabWrapper';
import usePermissions from '~/features/permissions/api/usePermissions';
import GraphManager from '~/features/station/components/GraphManager';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {useTilsyn} from '~/features/tilsyn/api/useTilsyn';
import TilsynForm from '~/features/tilsyn/components/TilsynForm';
import TilsynTable from '~/features/tilsyn/components/TilsynTable';
import {stationPages} from '~/helpers/EnumHelper';
import {zodDayjs} from '~/helpers/schemas';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
import {TilsynItem} from '~/types';

const tilsynSchema = z.object({
  dato: zodDayjs('Tidspunkt skal være udfyldt'),
  gid: z.number().optional().default(-1),
  batteriskift: z.boolean().optional().default(false),
  tilsyn: z.boolean().optional().default(false),
  kommentar: z.string().optional(),
});

export type TilsynSchemaType = z.infer<typeof tilsynSchema>;

export default function Tilsyn() {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const [showForm, setShowForm] = useShowFormState();
  const {isTouch, isLaptop} = useBreakpoints();
  const initialData: TilsynSchemaType = {
    dato: dayjs().startOf('minute'),
    gid: -1,
    batteriskift: false,
    kommentar: '',
    tilsyn: false,
  };

  const {
    feature_permission_query: {data: permissions},
    location_permissions,
  } = usePermissions(loc_id);

  const {data: tilsynData} = tilsynSchema.safeParse(initialData);

  const formMethods = useForm<TilsynSchemaType>({
    resolver: zodResolver(tilsynSchema),
    defaultValues: tilsynData,
    mode: 'onTouched',
  });

  const {reset, getValues} = formMethods;

  const {post: postTilsyn, put: putTilsyn, del: delTilsyn} = useTilsyn();

  const handleServiceSubmit = (values: TilsynSchemaType) => {
    const mutationOptions = {
      onSuccess: () => {
        resetFormData();
      },
    };

    if (values.gid === -1) {
      const payload = {data: values, path: `${ts_id}`};
      postTilsyn.mutate(payload, mutationOptions);
    } else {
      const payload = {data: values, path: `${ts_id}/${values.gid}`};
      putTilsyn.mutate(payload, mutationOptions);
    }
  };

  const handleEdit = (data: TilsynItem) => {
    const {data: parsedData} = tilsynSchema.safeParse(data);

    reset(parsedData, {keepDirty: true});
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
    <>
      <Box>
        <GraphManager
          key={'tilsyn' + ts_id}
          defaultDataToShow={{
            Kontrolmålinger: true,
          }}
        />
      </Box>
      <Divider />
      <StationPageBoxLayout>
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
            disabled={permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit'}
          />
        </Box>
        <Box display="flex" justifyContent={'flex-end'} gap={1}>
          <FabWrapper
            icon={<PlaylistAddRounded />}
            text={'Tilføj ' + stationPages.TILSYN}
            onClick={() => {
              setShowForm(true);
            }}
            disabled={permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit'}
            sx={{visibility: showForm === null ? 'visible' : 'hidden', ml: 0}}
          />
        </Box>
      </StationPageBoxLayout>
    </>
  );
}
