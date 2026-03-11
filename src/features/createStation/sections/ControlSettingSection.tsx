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
  setShow: (show: boolean) => void;
};

const ControlSettingSection = ({uuid, setShow}: Props) => {
  const {isMobile} = useBreakpoints();
  const [setState, control_settings] = useCreateStationStore((state) => [
    state.setState,
    state.formState.timeseries?.[uuid]?.control_settings,
  ]);

  const id = `timeseries.${uuid}.control_settings`;

  const show = control_settings !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="column" alignItems={'start'}>
        <FormFieldset
          label="Kontrolhyppighed"
          labelPosition={isMobile ? -22 : -20}
          sx={{width: '100%', p: 1}}
        >
          <Button
            bttype="primary"
            startIcon={<RemoveCircleOutline color="primary" />}
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
              setShow(false);
            }}
          >
            <Typography variant="body1" color={'primary'}>
              Senere
            </Typography>
          </Button>
          <ControlSettingForm
            id={id}
            values={control_settings}
            setValues={(value) => setState(`timeseries.${uuid}.control_settings`, value)}
          />
        </FormFieldset>
      </Box>
    );

  return (
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
          Registrer kontrolhyppighed
        </Typography>
      </Button>
    </Box>
  );
};

export default ControlSettingSection;
