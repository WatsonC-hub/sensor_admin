import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';
import ControlSettingForm from '../forms/ControlSettingForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  uuid: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const ControlSettingSection = ({uuid, show, setShow}: Props) => {
  const {isMobile} = useBreakpoints();
  const [setState, deleteState, control_settings] = useCreateStationStore((state) => [
    state.setState,
    state.deleteState,
    state.formState.timeseries?.[uuid]?.control_settings,
  ]);

  const id = `timeseries.${uuid}.control_settings`;

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
                  deleteState(`timeseries.${uuid}.control_settings`);
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
          <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
            {!isMobile && (
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setShow(false);
                  deleteState(`timeseries.${uuid}.control_settings`);
                }}
              >
                <RemoveCircleOutline fontSize="small" />
              </IconButton>
            )}
            <ControlSettingForm
              id={id}
              values={control_settings}
              setValues={(value) => setState(`timeseries.${uuid}.control_settings`, value)}
            />
          </Box>
        </FormFieldset>
      )}
      {!show && (
        <Box alignItems={'center'}>
          <Button
            bttype="primary"
            startIcon={<AddCircleOutline color="primary" />}
            sx={{
              width: 'fit-content',
              backgroundColor: 'transparent',
              border: 'none',
              px: 1,
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
