import {IconButton, Tooltip, TooltipProps} from '@mui/material';
import React from 'react';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

type Props = {
  fieldDescriptionText?: string;
  disabled?: boolean;
} & Omit<TooltipProps, 'title' | 'children'>;

const LinkableTooltip = ({fieldDescriptionText, disabled, ...tooltipProps}: Props) => {
  return (
    <Tooltip title={fieldDescriptionText} arrow {...tooltipProps}>
      <IconButton
        disabled={disabled}
        onClick={() => {
          window.open('https://www.lipsum.com/', '_blank');
        }}
        size="small"
      >
        <QuestionMarkIcon />
      </IconButton>
    </Tooltip>
  );
};

export default LinkableTooltip;
