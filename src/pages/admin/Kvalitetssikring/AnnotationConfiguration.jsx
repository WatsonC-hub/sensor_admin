import {useState} from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
} from '@mui/material';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import {useAtomValue} from 'jotai';
import {qaSelection} from 'src/state/atoms';
import moment from 'moment';
import {toast} from 'react-toastify';

const AnnotationConfiguration = ({stationId}) => {
  const selection = useAtomValue(qaSelection);

  const queryClient = useQueryClient();

  const handledMutation = useMutation(async (data) => {
    const {data: res} = await apiClient.post(`/sensor_admin/qa_handled/${stationId}`);
    return res;
  });

  const [annotationConfiguration, setAnnotationConfiguration] = useState({
    active: false,
    label: 1,
    annotateDateRange: true,
  });

  const {data: label_options} = useQuery(['label_options'], async () => {
    const {data} = await apiClient.get(`/sensor_admin/label_options`);
    return data;
  });

  const labelMutation = useMutation(async (data) => {
    const {data: res} = await apiClient.post(`/sensor_admin/qa_labels/${stationId}`, data);
    return res;
  });

  const handleSelectionAnnotate = () => {
    if (annotationConfiguration.annotateDateRange) {
      // Annotate date range
      const moments = selection.map((d) => moment(d.x));
      const startdate = moment.min(moments).format('YYYY-MM-DD HH:mm:ss');
      const enddate = moment.max(moments).format('YYYY-MM-DD HH:mm:ss');
      labelMutation.mutate(
        [
          {
            label_id: annotationConfiguration?.label,
            startdate,
            enddate,
          },
        ],
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['qa_labels']);
          },
        }
      );
    } else {
      // Annotate point selection
      const payload = selection.map((d) => ({
        label_id: annotationConfiguration?.label,
        startdate: moment(d.x).format('YYYY-MM-DD HH:mm:ss'),
        enddate: moment(d.x).format('YYYY-MM-DD HH:mm:ss'),
      }));
      labelMutation.mutate(payload);
    }
  };
  return (
    <>
      <Button
        ml={1}
        color="secondary"
        variant="contained"
        onClick={async () => {
          toast.promise(() => handledMutation.mutateAsync(), {
            pending: 'Markerer som færdighåndteret',
            success: 'Færdighåndteret',
            error: 'Fejl',
          });
        }}
      >
        Færdighåndteret til nu
      </Button>

      <Card
        sx={{
          // textAlign: 'center',
          justifyContent: 'center',
          alignContent: 'center',
          borderRadius: 2,
          border: 2,
          borderColor: 'secondary.main',
          // backgroundColor: 'primary.light',
          // color: 'primary.contrastText',
          // width: 300,
          mt: 1,
        }}
      >
        <CardHeader title={'Annotering'} sx={{}} />
        <CardContent
          sx={{
            p: 1,
            m: 1,
            flexDirection: 'column',
            display: 'flex',
          }}
        >
          {/* <Typography
          sx={{
            flexDirection: 'column',
            display: 'flex',
          }}
        >
          Annoter tidsserien
        </Typography> */}
          <TextField
            value={annotationConfiguration.label}
            name="label"
            label="Label"
            select
            onChange={(e) => {
              setAnnotationConfiguration({
                ...annotationConfiguration,
                label: e.target.value,
              });
            }}
          >
            {label_options?.map((elem) => (
              <MenuItem key={elem.gid} value={elem.gid}>
                {elem.name}
              </MenuItem>
            ))}
          </TextField>

          {/* <Typography>Annoter algoritme output</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={annotationConfiguration.active}
              onChange={(e) => {
                setAnnotationConfiguration({
                  ...annotationConfiguration,
                  active: e.target.checked,
                });
              }}
            />
          }
          label="Aktiver"
        /> */}

          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={annotationConfiguration.annotateDateRange}
              onChange={(e) => {
                setAnnotationConfiguration({
                  ...annotationConfiguration,
                  annotateDateRange: e.target.value === 'true',
                });
              }}
            >
              <FormControlLabel value={true} control={<Radio />} label="Dato range" />
              <FormControlLabel value={false} control={<Radio />} label="Punkt selektion" />
            </RadioGroup>
          </FormControl>
          <Button
            p={2}
            color="primary"
            variant="contained"
            onClick={() => {
              console.log(annotationConfiguration);
              console.log(selection);
              handleSelectionAnnotate();
            }}
          >
            Annoter
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default AnnotationConfiguration;
