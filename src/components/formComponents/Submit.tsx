import {Save} from '@mui/icons-material';
import {FieldValues, useFormContext} from 'react-hook-form';
import Button from '../Button';
import {ButtonProps, Typography} from '@mui/material';

type SubmitProps<T> = ButtonProps & {
  submit: (values: T) => void;
};

const Submit = <T extends FieldValues>({submit}: SubmitProps<T>) => {
  const {
    handleSubmit,
    formState: {errors, isDirty, isSubmitting},
  } = useFormContext<T>();

  return (
    <Button
      bttype="primary"
      fullWidth={false}
      startIcon={isSubmitting ? undefined : <Save />}
      disabled={Object.keys(errors).length > 0 || !isDirty}
      loading={isSubmitting}
      onClick={handleSubmit(submit, (errors) => console.log('errors:', errors))}
    >
      <Typography variant="body2">Gem</Typography>
    </Button>
  );
};

export default Submit;
