import {Save} from '@mui/icons-material';
import {FieldValues, useFormContext} from 'react-hook-form';
import Button from '../Button';

const Submit = <T extends FieldValues>({submit}: {submit: (values: T) => void}) => {
  const {
    handleSubmit,
    formState: {errors},
  } = useFormContext<T>();

  return (
    <Button
      bttype="primary"
      fullWidth={false}
      startIcon={<Save />}
      disabled={Object.keys(errors).length > 0}
      onClick={handleSubmit(submit, (errors) => console.log('errors:', errors))}
    >
      Gem
    </Button>
  );
};

export default Submit;
