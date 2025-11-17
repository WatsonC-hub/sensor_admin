import {Warning} from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import {useMutation} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import TooltipWrapper from '~/components/TooltipWrapper';
import usePermissions from '~/features/permissions/api/usePermissions';
import useDeleteTimeseries from '~/features/station/api/useDeleteTimeseries';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import DeleteTimeseriesDialog from '~/features/station/components/DeleteTimeseriesDialog';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import {boreholeEditTimeseriesSchema, defaultEditTimeseriesSchema} from '~/features/station/schema';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';

const EditTimeseries = () => {
  const setTsId = useDisplayState((state) => state.setTsId);
  const {ts_id, loc_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const del = useDeleteTimeseries();
  const [assertDeletion, setAssertDeletion] = React.useState(false);

  const {location_permissions} = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const metadataEditTimeseriesMutation = useMutation({
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(
        `/sensor_field/stamdata/update_timeseries/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      toast.success('Tidsserie er opdateret');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  let schema;

  if (metadata?.loctype_id === 9) {
    schema = boreholeEditTimeseriesSchema;
  } else {
    schema = defaultEditTimeseriesSchema;
  }

  const {data: defaultValues, error} = schema.safeParse({
    prefix: metadata?.prefix,
    sensor_depth_m: metadata?.sensor_depth_m,
    intakeno: metadata?.intakeno,
  });

  const [formMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      // defaultValues: defaultValues,
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
    getValues: getTimeseriesValues,
    trigger,
  } = formMethods;

  useEffect(() => {
    if (error) {
      trigger();
    }
  }, []);

  const Submit = () => {
    if (isValid && isDirty) {
      const data = getTimeseriesValues();
      const payload = {
        ...data,
      };
      metadataEditTimeseriesMutation.mutate(payload);
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
          <TooltipWrapper
            description="Slet tidsserien kun hvis du er helt sikker. Det er ikke muligt at fortryde handlingen"
            withIcon={false}
          >
            <Button bttype="danger" startIcon={<Warning />} onClick={() => setAssertDeletion(true)}>
              Slet tidsserie
            </Button>
          </TooltipWrapper>
          <Button
            bttype="tertiary"
            onClick={() => {
              reset(defaultValues);
            }}
            disabled={location_permissions !== 'edit'}
          >
            Annuller
          </Button>

          <Button
            bttype="primary"
            disabled={!isDirty || !isValid || location_permissions !== 'edit'}
            onClick={Submit}
            startIcon={<SaveIcon />}
            sx={{marginRight: 1}}
          >
            Gem
          </Button>
        </Box>
      </FormProvider>
      <DeleteTimeseriesDialog
        open={assertDeletion}
        onClose={() => setAssertDeletion(false)}
        onDelete={() => {
          const payload = {
            path: ts_id.toString(),
          };
          del.mutate(payload, {
            onSuccess: () => {
              setAssertDeletion(false);
              setTsId(null);
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
