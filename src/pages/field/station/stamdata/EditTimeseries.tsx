import {Warning} from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';

import Button from '~/components/Button';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import useDeleteTimeseries from '~/features/station/api/useDeleteTimeseries';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import ConfirmDeleteDialog from '~/features/station/components/ConfirmDeleteDialog';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import {
  BoreholeEditTimeseries,
  boreholeEditTimeseriesSchema,
  DefaultEditTimeseries,
  defaultEditTimeseriesSchema,
} from '~/features/station/schema';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import useUpdateTimeseries from '~/hooks/useUpdateTimeseries';
import {useAppContext} from '~/state/contexts';

const EditTimeseries = () => {
  const setTsId = useDisplayState((state) => state.setTsId);
  const [, setPage] = useStationPages();
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const mutation = useDeleteTimeseries();
  const [assertDeletion, setAssertDeletion] = React.useState(false);
  const {superUser} = useUser();

  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const {updateTimeseries} = useUpdateTimeseries(ts_id);

  let schema;

  if (metadata?.loctype_id === 9) {
    schema = boreholeEditTimeseriesSchema;
  } else {
    schema = defaultEditTimeseriesSchema;
  }

  const {data: defaultValues, error} = schema.safeParse({
    prefix: metadata?.prefix,
    ...(metadata?.calculated ? {} : {sensor_depth_m: metadata?.sensor_depth_m}),
    intakeno: metadata?.intakeno,
    requires_auth: metadata?.requires_auth ?? false,
    hide_public: metadata?.hide_public ?? false,
    calypso_id: metadata?.timeseries_calypso_id ?? undefined,
  });

  const [formMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      context: {
        loctype_id: metadata?.loctype_id,
      },
      values: defaultValues,
    },
    mode: 'Edit',
  });

  const {
    formState: {isDirty, isValid},
    reset,
    trigger,
    handleSubmit,
  } = formMethods;

  useEffect(() => {
    if (error) {
      trigger();
    }
  }, []);

  const Submit = (data: BoreholeEditTimeseries | DefaultEditTimeseries) => {
    if (isValid && isDirty) {
      const payload = {
        ...data,
      };
      updateTimeseries.mutate(payload);
    }
  };

  return (
    <Box
      maxWidth={1080}
      display={'flex'}
      flexDirection="column"
      gap={2}
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        padding: 2,
      }}
    >
      <FormProvider {...formMethods}>
        <StamdataTimeseries boreholeno={metadata?.boreholeno ?? undefined}>
          <TimeseriesForm size={size} loc_name={metadata?.loc_name} />
        </StamdataTimeseries>

        <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
          {superUser && !metadata?.calculated && (
            <TooltipWrapper
              description="Slet tidsserien kun hvis du er helt sikker. Det er ikke muligt at fortryde handlingen"
              withIcon={false}
            >
              <Button
                bttype="danger"
                startIcon={<Warning />}
                disabled={metadata?.calculated}
                onClick={() => setAssertDeletion(true)}
              >
                Slet tidsserie
              </Button>
            </TooltipWrapper>
          )}
          <Button
            bttype="tertiary"
            onClick={() => {
              reset(defaultValues);
            }}
            disabled={location_permissions !== 'edit' || !isDirty}
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
        description="Dette vil slette alle kontrolmålinger, opgaver, målepunkter og konfigurationer knyttet til denne tidsserie. Denne handling kan ikke fortrydes."
        onClose={() => setAssertDeletion(false)}
        isPending={mutation.isPending}
        onDelete={() => {
          const payload = {
            path: ts_id.toString(),
          };
          mutation.mutate(payload, {
            onSuccess: () => {
              setAssertDeletion(false);
              setTsId(null);
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

export default EditTimeseries;
