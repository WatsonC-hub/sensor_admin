import {useFormContext} from 'react-hook-form';
import Button from '../Button';
import {Typography} from '@mui/material';

const Cancel = ({cancel, disabled}: {cancel: () => void; disabled?: boolean}) => {
  const {
    reset,
    formState: {isDirty},
  } = useFormContext();
  return (
    <Button
      bttype="tertiary"
      fullWidth={false}
      onClick={() => {
        reset();
        cancel();
      }}
      disabled={disabled || !isDirty}
    >
      <Typography variant="body2">Annuller</Typography>
    </Button>
  );
};

export default Cancel;
