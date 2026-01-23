import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';
import ControlSettingForm from '../forms/ControlSettingForm';
import {AggregateControllerType} from '../controller/types';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  controller: AggregateControllerType;
};

const ControlSettingSection = ({show, setShow, controller}: Props) => {
  const {isMobile} = useBreakpoints();

  return (
    <>
      {show && (
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  setShow(false);
                  controller.unregisterSlice('control_settings');
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Kontrolhyppighed
                </Typography>
              </Button>
            ) : (
              'Kontrolhyppighed'
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
                  controller.unregisterSlice('control_settings');
                }}
              >
                <RemoveCircleOutline />
              </IconButton>
            )}
            <ControlSettingForm controller={controller} />
          </Box>
        </FormFieldset>
      )}
      {!show && (
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
              Tilføj kontrolhyppighed
            </Typography>
          </Button>
        </Box>
      )}
    </>
  );
};

export default ControlSettingSection;
