import {Dialog, IconButton, Tooltip, TooltipProps, Typography} from '@mui/material';
import React from 'react';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  fieldDescriptionText?: string;
  disabled?: boolean;
} & Omit<TooltipProps, 'title' | 'children'>;

const LinkableTooltip = ({fieldDescriptionText, disabled, ...tooltipProps}: Props) => {
  const {isTouch} = useBreakpoints();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip title={fieldDescriptionText} arrow {...tooltipProps}>
        <IconButton
          disabled={disabled}
          onClick={() => {
            if (!isTouch) window.open('https://www.lipsum.com/', '_blank');
            else setOpen(true);
          }}
          size="small"
        >
          <QuestionMarkIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open && !!fieldDescriptionText && isTouch}
        onClose={() => {
          setOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <Typography variant="body2" sx={{padding: 2}}>
          {fieldDescriptionText}
        </Typography>
      </Dialog>
    </>
  );
};

export default LinkableTooltip;
