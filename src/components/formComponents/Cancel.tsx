import {useFormContext} from 'react-hook-form';
import Button from '../Button';

const Cancel = ({cancel}: {cancel: () => void}) => {
  const {reset} = useFormContext();
  return (
    <Button
      bttype="tertiary"
      fullWidth={false}
      onClick={() => {
        reset();
        cancel();
      }}
    >
      Annuller
    </Button>
  );
};

export default Cancel;
