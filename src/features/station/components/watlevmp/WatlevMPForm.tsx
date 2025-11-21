import {Box, Typography} from '@mui/material';
import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
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
    formState: {defaultValues},
  } = formMethods;

  const {post: postWatlevmp, put: putWatlevmp} = useMaalepunkt(ts_id);

  const handleMaalepunktSubmit = (values: WatlevMPFormValues) => {
    console.log('Submitting WatlevMPForm with values:', values);
    const mutationOptions = {
      onSuccess: () => {
        reset(initialWatlevmpData());
        setShowForm(null);
      },
    };

    const data = {
      ...values,
    };

    if (values.gid === undefined) {
      const payload = {
        data: data,
        path: `${ts_id}`,
      };
      postWatlevmp.mutate(payload, mutationOptions);
    } else {
      const payload = {
        data: data,
        path: `${ts_id}/${values.gid}`,
      };
      putWatlevmp.mutate(payload, mutationOptions);
    }
  };

  return (
    <Box maxWidth={600} margin="auto">
      <Form
        formMethods={formMethods}
        label={defaultValues?.gid ? 'Rediger målepunkt' : 'Indberet målepunkt'}
      >
        <Form.Input
          name="elevation"
          label="Pejlepunkt [m]"
          required
          type="number"
          gridSizes={defaultValues?.gid !== undefined ? 12 : undefined}
          slotProps={{
            input: {
              endAdornment: <Typography variant="body2">m</Typography>,
            },
          }}
        />
        <Form.DateTime
          name="startdate"
          label={defaultValues?.gid !== undefined ? 'Start dato' : 'Dato'}
        />
        {defaultValues?.gid !== undefined && <Form.DateTime name="enddate" label="Slut dato" />}

        <Form.Input
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
