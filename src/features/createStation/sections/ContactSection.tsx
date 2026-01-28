import React, {useState} from 'react';
import {LocationController} from '../controller/types';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Typography, Box, IconButton} from '@mui/material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import ContactForm from '../forms/ContactForm';

type Props = {
  controller: LocationController | undefined;
};

const ContactSection = ({controller}: Props) => {
  const [show, setShow] = useState(false);

  const {isMobile} = useBreakpoints();
  if (show)
    return (
      <FormFieldset
        label={
          isMobile ? (
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                setShow(false);
                controller?.unregisterSlice('contacts');
              }}
            >
              <Typography variant="body2" color="grey.700">
                Kontakter
              </Typography>
            </Button>
          ) : (
            'Kontakter'
          )
        }
        labelPosition={isMobile ? -22 : -20}
        sx={{width: '100%', p: 1}}
      >
        <Box display="flex" flexDirection="row" gap={1}>
          {!isMobile && (
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setShow(false);
                controller?.unregisterSlice('contacts');
              }}
            >
              <RemoveCircleOutline />
            </IconButton>
          )}
          <ContactForm controller={controller} />
        </Box>
      </FormFieldset>
    );

  return (
    <Box>
      <Button
        bttype="primary"
        startIcon={<AddCircleOutline color="primary" />}
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          border: 'none',
          px: 0.5,
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setShow(true);
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj kontakt
        </Typography>
      </Button>
    </Box>
  );
};

export default ContactSection;
