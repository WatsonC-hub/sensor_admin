import {useAutoAnimate} from '@formkit/auto-animate/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Accordion, AccordionDetails, AccordionSummary, Box, Typography} from '@mui/material';
import React, {ReactNode} from 'react';

import BoxNumber from '~/components/BoxNumber';

interface QaAccordionProps {
  children: ReactNode;
  number: number;
  title: string;
}

const QAAccordion = ({children, number, title}: QaAccordionProps) => {
  const [parent] = useAutoAnimate();
  return (
    <Accordion disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="panel1a-header"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, .04)',
        }}
      >
        <BoxNumber>{<Typography>{number}</Typography>}</BoxNumber>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box ref={parent}>{children}</Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default QAAccordion;
