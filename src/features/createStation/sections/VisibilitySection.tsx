import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';
import VisibilityForm from '../forms/VisibilityForm';

type Props = {
  uuid: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const VisibilitySection = ({uuid, show, setShow}: Props) => {
  const {isMobile} = useBreakpoints();
  const [setState, visibility, deleteState] = useCreateStationStore((state) => [
    state.setState,
    state.formState.timeseries?.[uuid]?.visibility,
    state.deleteState,
  ]);

  const id = `timeseries.${uuid}.visibility`;

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
                  deleteState(`timeseries.${uuid}.visibility`);
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Tilgængelighed
                </Typography>
              </Button>
            ) : (
              'Tilgængelighed'
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
                  deleteState(`timeseries.${uuid}.visibility`);
                }}
              >
                <RemoveCircleOutline fontSize="small" />
              </IconButton>
            )}
            <VisibilityForm
              id={id}
              visibility={visibility}
              setValues={(value) => setState(`timeseries.${uuid}.visibility`, value)}
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
              Tilføj tilgængelighed
            </Typography>
          </Button>
        </Box>
      )}
    </>
  );
};

export default VisibilitySection;
