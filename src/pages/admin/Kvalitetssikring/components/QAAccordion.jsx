import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Button,
  Skeleton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useAutoAnimate} from '@formkit/auto-animate/react';
import BoxNumber from 'src/components/BoxNumber';

const QAAccordion = ({children, number, title, accordionProps}) => {
  const [parent] = useAutoAnimate();
  return (
    <Accordion disableGutters {...accordionProps}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
          // borderRadius: '5px',
        }}
      >
        <BoxNumber>
          <Typography>{number}</Typography>
        </BoxNumber>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box ref={parent}>{children}</Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default QAAccordion;
