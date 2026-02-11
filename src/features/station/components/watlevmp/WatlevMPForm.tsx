import {Autocomplete, Box, Grid2, TextField, Typography} from '@mui/material';
import {Controller, UseFormReturn} from 'react-hook-form';
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

const options = [
  {label: 'Top rør'},
  {label: 'Top WatsonC-prop'},
  {label: 'Pejlestuds'},
  {label: 'Bund af v-overløb'},
  {label: 'Overløbskant'},
  {label: 'Skal indmåles'},
];

const WatlevMPForm = ({formMethods}: WatlevMPFormProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const [, setShowForm] = useShowFormState();
  const {
    reset,
    formState: {defaultValues},
  } = formMethods;

  const {post: postWatlevmp, put: putWatlevmp} = useMaalepunkt(ts_id);
  const handleMaalepunktSubmit = (values: WatlevMPFormValues) => {
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
          label="Målepunkt [m DVR90]"
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

        <Grid2 size={12}>
          <Controller
            name="mp_description"
            control={formMethods.control}
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <Autocomplete
                  disablePortal
                  freeSolo
                  disableClearable
                  slotProps={{}}
                  options={options}
                  inputValue={value ?? ''}
                  value={value ?? ''}
                  ref={ref}
                  fullWidth
                  onBlur={onBlur}
                  onInputChange={(e, value) => onChange(value)}
                  onChange={(e, value) => onChange(typeof value == 'string' ? value : value.label)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="F.eks. Top rør"
                      multiline
                      slotProps={{
                        inputLabel: {
                          shrink: true,

                          sx: {
                            '& .Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'},
                            color: 'primary.main',
                            zIndex: 0,
                          },
                        },
                      }}
                      rows={3}
                      label="Beskrivelse"
                    />
                  )}
                />
              );
            }}
          />
        </Grid2>

        <Box
          display={'flex'}
          gap={1}
          justifySelf="flex-end"
          justifyContent="flex-end"
          mr={0}
          ml="auto"
        >
          <Form.Cancel
            disabled={false}
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
