import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useState} from 'react';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import {qaSelection} from 'src/state/atoms';

const AnnotationConfiguration = ({stationId}) => {
  const selection = useAtomValue(qaSelection);

  const queryClient = useQueryClient();

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
      const moments = selection.points.map((d) => moment(d.x));
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
            toast.success('Annoteret', {autoClose: 1000});
            queryClient.invalidateQueries(['qa_labels']);
          },
        }
      );
    } else {
      // Annotate point selection
      const payload = selection.points.map((d) => ({
        label_id: annotationConfiguration?.label,
        startdate: moment(d.x).format('YYYY-MM-DD HH:mm:ss'),
        enddate: moment(d.x).format('YYYY-MM-DD HH:mm:ss'),
      }));
      labelMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Annoteret', {autoClose: 1000});
        },
      });
    }
  };
  return (
    <>
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
