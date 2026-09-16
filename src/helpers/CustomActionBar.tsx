import {PickersActionBar, PickersActionBarProps} from '@mui/x-date-pickers/PickersActionBar';
import {Button, Stack} from '@mui/material';

type CustomActionBarProps = PickersActionBarProps & {
  customAction?: () => void;
  disabled?: boolean;
  label?: string;
};

function CustomActionBar({
  customAction,
  disabled,
  label = 'Næste kontrol',
  ...props
}: CustomActionBarProps) {
  return (
    <>
      <Stack direction="column" justifyContent="end" alignItems={'end'}>
        <Button
          onClick={customAction}
          sx={{pr: 3.5, py: 0.5, textTransform: 'inherit'}}
          disabled={disabled}
        >
          {label}
        </Button>
        <PickersActionBar {...props} />
      </Stack>
    </>
  );
}
export default CustomActionBar;
