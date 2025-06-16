import {Delete} from '@mui/icons-material';
import {Grid2, MenuItem} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmCriteriaArrayFormValues} from '../schema';
import {useFormContext} from 'react-hook-form';

type AlarmCriteriaFormProps = {
  index: number;
  remove: (index: number) => void;
};

const AlarmCriteriaTypedForm = createTypedForm<AlarmCriteriaArrayFormValues>();

const AlarmCriteriaForm = ({index, remove}: AlarmCriteriaFormProps) => {
  const {watch} = useFormContext<AlarmCriteriaArrayFormValues>();
  const criteria = watch(`criteria`);
  return (
    <Grid2 container spacing={1} style={{width: '100%'}}>
      <AlarmCriteriaTypedForm.Input
        name={`criteria.${index}.attention_level`}
        select
        fullWidth
        required
        label="Vælg niveau"
        slotProps={{
          select: {
            displayEmpty: true,
          },
        }}
        gridSizes={{xs: 12, sm: 6}}
      >
        <MenuItem value="" disabled>
          Vælg niveau
        </MenuItem>
        <MenuItem
          value="attention_high"
          disabled={criteria?.some((c) => c.attention_level === 'attention_high')}
        >
          Øvre opmærksomhedsniveau
        </MenuItem>
        <MenuItem
          value="attention_low"
          disabled={criteria?.some((c) => c.attention_level === 'attention_low')}
        >
          Nedre opmærksomhedsniveau
        </MenuItem>
        <MenuItem
          value="alarm_high"
          disabled={criteria?.some((c) => c.attention_level === 'alarm_high')}
        >
          Øvre alarmniveau
        </MenuItem>
        <MenuItem
          value="alarm_low"
          disabled={criteria?.some((c) => c.attention_level === 'alarm_low')}
        >
          Nedre alarmniveau
        </MenuItem>
      </AlarmCriteriaTypedForm.Input>
      <AlarmCriteriaTypedForm.Input
        name={`criteria.${index}.criteria`}
        type="number"
        fullWidth
        required
        placeholder="Indtast kriterium"
        label="Kriterium"
        gridSizes={{xs: 6, sm: 4}}
      />
      <Grid2 size={{xs: 6, sm: 2}} height={'fit-content'} alignSelf={'center'} display="flex">
        <Button
          bttype="tertiary"
          startIcon={<Delete />}
          onClick={() => {
            remove(index);
          }}
        >
          Fjern
        </Button>
      </Grid2>
    </Grid2>
  );
};

export default AlarmCriteriaForm;
