import {Button, Stack} from '@mui/material';
import {PickersActionBar} from '@mui/x-date-pickers/PickersActionBar';

import type {PickersActionBarProps} from '@mui/x-date-pickers/PickersActionBar';

type CustomActionBarProps = PickersActionBarProps & {
  customAction?: () => void;
  disabled?: boolean;
};

function CustomActionBar({customAction, disabled, ...props}: CustomActionBarProps) {
  return (
    <>
      <Stack
        direction="column"
        sx={{
          justifyContent: 'end',
          alignItems: 'end',
        }}
      >
        <Button
          onClick={customAction}
          sx={{pr: 3.5, py: 0.5, textTransform: 'inherit'}}
          disabled={disabled}
        >
          Næste kontrol
        </Button>
        <PickersActionBar {...props} />
      </Stack>
    </>
  );
}
export default CustomActionBar;
