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
} from '@mui/material';
import {useQuery} from '@tanstack/react-query';

const AnnotationConfiguration = ({
  label_options,
  annotationConfiguration,
  setAnnotationConfiguration,
}) => {
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
      </CardContent>
    </Card>
  );
};

export default AnnotationConfiguration;
