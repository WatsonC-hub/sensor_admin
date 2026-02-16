import {RemoveCircleOutline, AddCircleOutline} from '@mui/icons-material';
import {Typography, Box, IconButton} from '@mui/material';
import React, {ReactNode, useState} from 'react';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';
import RessourceForm from '../forms/RessourceForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

const RessourceSection = () => {
  const [ressourcer, deleteState] = useCreateStationStore((state) => [
    state.formState.location?.ressourcer,
    state.deleteState,
  ]);
  const [show, setShow] = useState(ressourcer && ressourcer.length > 0);

  const {isMobile} = useBreakpoints();

  return (
    <>
      {show ? (
        <Layout
          show={show}
          label={
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                setShow(false);
                deleteState('location.ressourcer');
              }}
            >
              <Typography variant="body2" color="grey.700">
                Ressourcer
              </Typography>
            </Button>
          }
        >
          <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
            {!isMobile && (
              <IconButton
                color="primary"
                size="small"
                onClick={() => {
                  setShow(false);
                  deleteState('location.ressourcer');
                }}
              >
                <RemoveCircleOutline fontSize="small" />
              </IconButton>
            )}
            <RessourceForm />
          </Box>
        </Layout>
      ) : (
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
              setShow(true);
            }}
          >
            <Typography variant="body1" color="primary">
              Tilføj ressource
            </Typography>
          </Button>
        </Box>
      )}
    </>
  );
};

type LayoutProps = {
  children: React.ReactNode;
  show: boolean | undefined;
  label: string | ReactNode;
};

const Layout = ({children, show, label}: LayoutProps) => {
  const {isMobile} = useBreakpoints();

  return (
    <FormFieldset
      label={isMobile && show ? label : 'Ressourcer'}
      labelPosition={-20}
      sx={{width: '100%', p: 1}}
    >
      {children}
    </FormFieldset>
  );
};

export default RessourceSection;
