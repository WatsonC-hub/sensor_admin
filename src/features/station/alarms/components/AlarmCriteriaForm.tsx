import {Grid2, MenuItem} from '@mui/material';
import React from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmCriteriaArrayFormValues} from '../schema';
import {useFormContext} from 'react-hook-form';

type AlarmCriteriaFormProps = {
  index: number;
  remove: (index: number) => void;
};

const AlarmCriteriaTypedForm = createTypedForm<AlarmCriteriaArrayFormValues>();

const AlarmCriteriaForm = ({index}: AlarmCriteriaFormProps) => {
  const {watch} = useFormContext<AlarmCriteriaArrayFormValues>();
  const criteria = watch(`criteria`);

  return (
    <Grid2 container spacing={1} style={{width: '100%'}}>
      <AlarmCriteriaTypedForm.Input
        name={`criteria.${index}.name`}
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
          disabled={criteria?.some((c) => c.name === 'attention_high')}
        >
          Øvre opmærksomhedsniveau
        </MenuItem>
        <MenuItem
          value="attention_low"
          disabled={criteria?.some((c) => c.name === 'attention_low')}
        >
          Nedre opmærksomhedsniveau
        </MenuItem>
        <MenuItem value="alarm_high" disabled={criteria?.some((c) => c.name === 'alarm_high')}>
          Øvre alarmniveau
        </MenuItem>
        <MenuItem value="alarm_low" disabled={criteria?.some((c) => c.name === 'alarm_low')}>
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
        gridSizes={{xs: 12, sm: 6}}
      />
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.sms`}
        label={`SMS`}
        gridSizes={{xs: 12, sm: 2}}
      />
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.email`}
        label={`Email`}
        gridSizes={{xs: 12, sm: 2}}
      />
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.call`}
        label={`Opkald`}
        gridSizes={{xs: 12, sm: 2}}
      />
      {/* <Grid2 size={{xs: 6, sm: 2}} height={'fit-content'} alignSelf={'center'} display="flex">
        <Button
          bttype="tertiary"
          startIcon={<Delete />}
          onClick={() => {
            remove(index);
          }}
        >
          Fjern
        </Button>
      </Grid2> */}
    </Grid2>
  );
};

export default AlarmCriteriaForm;
