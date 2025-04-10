import React from 'react';
import StamdataForm from './stamdata/StamdataForm';
import NavBar from '~/components/NavBar';
import StationPageBoxLayout from './StationPageBoxLayout';
import {Grid2} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import StamdataFormWrapper from './stamdata/StamdataFormWrapper';

const CreateStation = () => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Title title="Opret Stamdata" />
        <NavBar.Menu />
      </NavBar>
      <StationPageBoxLayout>
        <StamdataForm
          onSubmit={() => {
            console.log('test');
          }}
          defaultValues={{
            location: {
              loctype_id: -1,
            },
          }}
        >
          <Grid2
            container
            alignSelf={'center'}
            display={'flex'}
            flexDirection={'column'}
            spacing={1}
            sx={{maxWidth: 1200, width: '100%'}}
            size={size}
          >
            <StamdataFormWrapper size={size} />
            <Grid2 size={12} sx={{display: 'flex', justifyContent: 'end'}} gap={2}>
              <StamdataForm.CancelButton />
              <StamdataForm.SubmitButton />
            </Grid2>
          </Grid2>
        </StamdataForm>
      </StationPageBoxLayout>
    </>
  );
};

export default CreateStation;
