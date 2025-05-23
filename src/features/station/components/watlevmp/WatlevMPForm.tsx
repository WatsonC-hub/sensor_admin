import {Box, Typography} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {createTypedForm} from '~/components/Form';
import {initialWatlevmpData} from '~/features/stamdata/components/stamdata/const';
import {WatlevMPFormValues} from '~/features/stamdata/components/stamdata/ReferenceForm';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

interface WatlevMPFormProps {
  formMethods: UseFormReturn<WatlevMPFormValues>;
}

const Form = createTypedForm<WatlevMPFormValues>();

const WatlevMPForm = ({formMethods}: WatlevMPFormProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const [, setShowForm] = useShowFormState();
  const {
    reset,
    getValues,
    formState: {defaultValues},
  } = formMethods;

  const {post: postWatlevmp, put: putWatlevmp} = useMaalepunkt();

  const handleMaalepunktSubmit = () => {
    const mpData = getValues();
    const mutationOptions = {
      onSuccess: () => {
        setShowForm(null);
      },
    };

    const data = {
      ...mpData,
      startDate: moment(mpData.startDate).toISOString(),
      endDate: moment(mpData.endDate).toISOString(),
    };

    if (mpData.gid === undefined) {
      const payload = {
        data: {
          ...data,
          startDate: moment(mpData.startDate).toISOString(),
          endDate: moment(mpData.endDate).toISOString(),
        },
        path: `${ts_id}`,
      };
      postWatlevmp.mutate(payload, mutationOptions);
    } else {
      const payload = {
        data: data,
        path: `${ts_id}/${mpData.gid}`,
      };
      putWatlevmp.mutate(payload, mutationOptions);
    }
  };

  return (
    <Box maxWidth={600} margin="auto">
      <Form formMethods={formMethods} label="Indberet målepunkt">
        <Form.FormInput
          name="elevation"
          label="Pejlepunkt [m]"
          type="number"
          gridSizes={defaultValues?.gid !== undefined ? 12 : undefined}
          slotProps={{
            input: {
              endAdornment: <Typography variant="body2">m</Typography>,
            },
          }}
        />
        <Form.FormInput
          name="startDate"
          label={defaultValues?.gid !== undefined ? 'Start dato' : 'Dato'}
          type="datetime-local"
        />
        {defaultValues?.gid !== undefined && (
          <Form.FormInput name="endDate" label="Slut dato" type="datetime-local" />
        )}

        <Form.FormInput
          name="mp_description"
          label="Kommentar"
          placeholder="F.eks.Pejl top rør"
          multiline
          rows={3}
          gridSizes={12}
        />
        <Box
          display={'flex'}
          gap={1}
          justifySelf="flex-end"
          justifyContent="flex-end"
          mr={0}
          ml="auto"
        >
          <Form.Cancel
            cancel={() => {
              if (defaultValues?.gid) reset(initialWatlevmpData());
              else reset();
              setShowForm(null);
            }}
          />
          <Form.Submit submit={handleMaalepunktSubmit} />
        </Box>
      </Form>
    </Box>
  );
};

export default WatlevMPForm;
