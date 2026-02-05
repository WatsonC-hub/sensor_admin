import {Warning} from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import useDeleteLocation from '~/features/station/api/useDeleteLocation';
import useLocationForm from '~/features/station/api/useLocationForm';
import ConfirmDeleteDialog from '~/features/station/components/ConfirmDeleteDialog';
import StamdataLocation from '~/features/station/components/stamdata/StamdataLocation';
import {BaseLocation} from '~/features/station/schema';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useLocationData} from '~/hooks/query/useMetadata';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

const EditLocation = () => {
  const setLocId = useDisplayState((state) => state.setLocId);
  const [, setPage] = useStationPages();
  const {loc_id} = useAppContext(['loc_id']);
  const [assertDeletion, setAssertDeletion] = React.useState(false);
  const mutation = useDeleteLocation();
  const {data: metadata} = useLocationData();
  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {superUser} = useUser();

  const metadataEditLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_location/${loc_id}`,
        data
      );
      return out;
    },
    meta: {
      invalidates: [queryKeys.Location.info(loc_id)],
      optOutGeneralInvalidations: true,
    },
  });

  const default_data = {...metadata, initial_project_no: metadata?.projectno} as BaseLocation;

  const [formMethods, LocationForm, locationSchema] = useLocationForm({
    defaultValues: default_data,
    mode: 'Edit',
    context: {
      loc_id,
    },
    initialLocTypeId: metadata?.loctype_id,
  });

  const {
    formState: {isDirty, isValid},
    reset,
    handleSubmit,
  } = formMethods;

  useEffect(() => {
    if (metadata != undefined) {
      reset(default_data);
    }
  }, [metadata]);

  const Submit: (data: z.infer<typeof locationSchema>) => void = (data) => {
    const payload = {
      ...data,
    };
    metadataEditLocationMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Location er opdateret');
      },
    });
  };

  return (
    <Box
      maxWidth={1080}
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        padding: 2,
      }}
    >
      <FormProvider {...formMethods}>
        <StamdataLocation>
          <LocationForm size={size} loc_id={loc_id} />
        </StamdataLocation>
        <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
          {superUser && (
            <TooltipWrapper
              description="Slet lokationen kun hvis du er helt sikker. Det er ikke muligt at fortryde handlingen"
              withIcon={false}
            >
              <Button
                bttype="danger"
                startIcon={<Warning />}
                onClick={() => setAssertDeletion(true)}
              >
                Slet lokation
              </Button>
            </TooltipWrapper>
          )}
          <Button
            bttype="tertiary"
            onClick={() => reset(default_data)}
            disabled={location_permissions !== 'edit'}
          >
            Annuller
          </Button>

          <Button
            bttype="primary"
            disabled={!isDirty || !isValid || location_permissions !== 'edit'}
            onClick={handleSubmit(Submit)}
            startIcon={<SaveIcon />}
            sx={{marginRight: 1}}
          >
            Gem
          </Button>
        </Box>
      </FormProvider>
      <ConfirmDeleteDialog
        open={assertDeletion}
        description="Sletter du lokationen, vil alle tilknyttede nøgler, kontakter, huskeliste og billeder også blive slettet. Denne handling kan ikke fortrydes."
        onClose={() => setAssertDeletion(false)}
        isPending={mutation.isPending}
        onDelete={() => {
          const payload = {path: loc_id};
          mutation.mutate(payload, {
            onSuccess: () => {
              setAssertDeletion(false);
              setLocId(null);
              setPage(null);
            },
            onError: () => {
              setAssertDeletion(false);
            },
          });
        }}
      />
    </Box>
  );
};

export default EditLocation;
