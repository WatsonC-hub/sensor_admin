import {RemoveCircleOutline, AddCircleOutline} from '@mui/icons-material';
import {Typography, Box, IconButton} from '@mui/material';
import React, {ReactNode} from 'react';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';
import RessourceForm from '../forms/RessourceForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

const RessourceSection = () => {
  const [ressourcer, deleteState, setState] = useCreateStationStore((state) => [
    state.formState.location?.ressourcer,
    state.deleteState,
    state.setState,
  ]);

  const {isMobile} = useBreakpoints();

  const show = ressourcer !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState('location.ressourcer');
            }}
          >
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        )}
        <Layout
          label={
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                deleteState('location.ressourcer');
              }}
            >
              <Typography variant="body2" color="grey.700">
                Ressourcer
              </Typography>
            </Button>
          }
        >
          <RessourceForm />
        </Layout>
      </Box>
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
          px: '6.5px',
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setState('location.ressourcer', []);
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj ressource
        </Typography>
      </Button>
    </Box>
  );
};

type LayoutProps = {
  children: React.ReactNode;
  label: string | ReactNode;
};

const Layout = ({children, label}: LayoutProps) => {
  const {isMobile} = useBreakpoints();

  return (
    <FormFieldset
      label={isMobile ? label : 'Ressourcer'}
      labelPosition={-20}
      sx={{width: '100%', p: 1}}
    >
      {children}
    </FormFieldset>
  );
};

export default RessourceSection;
