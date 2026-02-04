import {zodResolver} from '@hookform/resolvers/zod';
import {Box, Grid2} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {createTypedForm} from '~/components/formComponents/Form';
import usePermissions from '~/features/permissions/api/usePermissions';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import {useStationProgress} from '~/hooks/query/stationProgress';
import {metadataQueryOptions} from '~/hooks/query/useMetadata';
import useUpdateTimeseries from '~/hooks/useUpdateTimeseries';

type VisibilityConfigProps = {
  loc_id: number;
  ts_id: number;
};

const schema = z.object({
  requires_auth: z.boolean().optional(),
  hide_public: z.boolean().optional(),
});

type Form = z.infer<typeof schema>;

const Form = createTypedForm<Form>();

const VisibilityConfig = ({loc_id, ts_id}: VisibilityConfigProps) => {
  const {hasAssessed, needsProgress} = useStationProgress(loc_id, 'visibility', ts_id);
  const {location_permissions} = usePermissions(loc_id);
  const {data: timeseries} = useQuery(
    metadataQueryOptions<Form>(ts_id, {
      select: (data) => ({
        requires_auth: data.requires_auth,
        hide_public: data.hide_public,
      }),
    })
  );

  const {updateTimeseries} = useUpdateTimeseries(ts_id);

  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      requires_auth: false,
      hide_public: false,
    },
    values: timeseries,
  });

  const {
    reset,
    formState: {isDirty},
  } = methods;

  return (
    <Box>
      <Form gridSizes={12} formMethods={methods}>
        <Form.Checkbox
          name="requires_auth"
          label="Data tilgængelighed kræver login"
          disabled={location_permissions !== 'edit'}
        />
        <Form.Checkbox
          name="hide_public"
          label="Skjul i offentlige visninger"
          disabled={location_permissions !== 'edit'}
        />
        <Grid2 size={12} display="flex" justifyContent={'flex-end'} gap={1}>
          <UpdateProgressButton
            loc_id={loc_id}
            disabled={isDirty || location_permissions !== 'edit'}
            ts_id={ts_id}
            progressKey="visibility"
          />
          <Form.Cancel disabled={location_permissions !== 'edit'} cancel={() => reset()} />
          <Form.Submit
            disabled={location_permissions !== 'edit'}
            submit={async (values) => {
              updateTimeseries.mutate(values, {
                onSuccess: () => needsProgress && hasAssessed(),
              });
            }}
          />
        </Grid2>
      </Form>
    </Box>
  );
};

export default VisibilityConfig;
