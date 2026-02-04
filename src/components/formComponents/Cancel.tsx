import {useFormContext} from 'react-hook-form';
import Button from '../Button';

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
      Annuller
    </Button>
  );
};

export default Cancel;
