import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, IconButton, Typography} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';
import VisibilityForm from '../forms/VisibilityForm';

const VisibilitySection = () => {
  const {isMobile} = useBreakpoints();
  const [setState, visibility, deleteState] = useCreateStationStore((state) => [
    state.setState,
    state.formState.location?.visibility,
    state.deleteState,
  ]);

  const show = visibility !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState(`location.visibility`);
            }}
          >
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        )}
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  deleteState(`location.visibility`);
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
          <VisibilityForm
            visibility={visibility}
            setValues={(value) => {
              setState(`location.visibility`, value);
            }}
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
          setState('location.visibility', {});
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj tilgængelighed
        </Typography>
      </Button>
    </Box>
  );
};

export default VisibilitySection;
