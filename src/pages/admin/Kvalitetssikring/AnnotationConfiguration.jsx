import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  CardActions,
  Button,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import {qaSelection} from 'src/state/atoms';
import moment from 'moment';

const AnnotationConfiguration = ({
  label_options,
  annotationConfiguration,
  setAnnotationConfiguration,
  labelMutation,
}) => {
  const selection = useAtomValue(qaSelection);

  const handleSelectionAnnotate = () => {
    if (annotationConfiguration.annotateDateRange) {
      // Annotate date range
      const moments = selection.map((d) => moment(d));
      const startdate = moment.min(moments).format('YYYY-MM-DD HH:mm:ss');
      const enddate = moment.max(moments).format('YYYY-MM-DD HH:mm:ss');
      labelMutation.mutate([
        {
          label_id: annotationConfiguration?.label,
          startdate,
          enddate,
        },
      ]);
    } else {
      // Annotate point selection
      const payload = selection.map((d) => ({
        label_id: annotationConfiguration?.label,
        startdate: moment(d).format('YYYY-MM-DD HH:mm:ss'),
        enddate: moment(d).format('YYYY-MM-DD HH:mm:ss'),
      }));
      labelMutation.mutate(payload);
    }
  };
  return (
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
        m: 1,
      }}
    >
      <CardHeader title={'Annotering'} sx={{}} />
      <CardContent
        sx={{
          p: 1,
          m: 0,
          flexDirection: 'column',
          display: 'flex',
        }}
      >
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
        <Typography>Annoter algoritme output</Typography>
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
        />

        <Typography>Annoter selektion</Typography>
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
  );
};

export default AnnotationConfiguration;
