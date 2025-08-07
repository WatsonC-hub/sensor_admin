import {Grid2} from '@mui/material';
import React from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmCriteriaArrayFormValues} from '../schema';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';

type AlarmCriteriaFormProps = {
  index: number;
  // disabled: boolean;
};

const AlarmCriteriaTypedForm = createTypedForm<AlarmCriteriaArrayFormValues>();

const criteriaTypes = [
  {id: 'alarm_high', name: 'Øvre alarmniveau'},
  {id: 'attention_high', name: 'Øvre opmærksomhedsniveau'},
  {id: 'attention_low', name: 'Nedre opmærksomhedsniveau'},
  {id: 'alarm_low', name: 'Nedre alarmniveau'},
  {id: 'sender_ikke', name: 'Sender ikke'},
] as const;

const AlarmCriteriaForm = ({index}: AlarmCriteriaFormProps) => {
  return (
    <Grid2 container spacing={2} alignItems={'center'} style={{width: '100%'}}>
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.selected`}
        label={criteriaTypes[index]?.name}
        gridSizes={{xs: 12, sm: 6.8}}
      />
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.sms`}
        icon={<SmsIcon color="primary" />}
        gridSizes={{xs: 12, sm: 1.7}}
      />
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.email`}
        icon={<EmailIcon color="primary" />}
        gridSizes={{xs: 12, sm: 1.7}}
      />
      <AlarmCriteriaTypedForm.Checkbox
        name={`criteria.${index}.call`}
        icon={<CallIcon color="primary" />}
        gridSizes={{xs: 12, sm: 1.7}}
      />
    </Grid2>
  );
};

export default AlarmCriteriaForm;
