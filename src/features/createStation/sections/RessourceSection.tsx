import {AddCircleOutline} from '@mui/icons-material';
import React, {ReactNode} from 'react';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';
import RessourceForm from '../forms/RessourceForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {button_sx} from '../common_style';

const RessourceSection = () => {
  const [ressourcer, setState] = useCreateStationStore((state) => [
    state.formState.location?.ressourcer,
    state.setState,
  ]);

  return (
    <Layout label="Ressourcer">
      {ressourcer === undefined && (
        <Button
          bttype="primary"
          startIcon={<AddCircleOutline />}
          sx={button_sx(ressourcer !== undefined)}
          onClick={() => {
            setState('location.ressourcer', []);
          }}
        >
          Tilføj ressourcer
        </Button>
      )}
      {ressourcer !== undefined && <RessourceForm />}
    </Layout>
  );
};

type LayoutProps = {
  children: React.ReactNode;
  label: string | ReactNode;
};

const Layout = ({children, label}: LayoutProps) => {
  const {isMobile} = useBreakpoints();

  return (
    <FormFieldset label={isMobile ? label : 'Ressourcer'} sx={{width: '100%', p: 1}}>
      {children}
    </FormFieldset>
  );
};

export default RessourceSection;
