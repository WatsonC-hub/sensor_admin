import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, Typography, IconButton} from '@mui/material';
import React from 'react';
import WatlevmpForm from '../forms/WatlevmpForm';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  index: string;
};

const WatlevmpSection = ({index}: Props) => {
  // const {isMobile} = useBreakpoints();
  const [intakeno, watlevmp, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index]?.meta?.intakeno,
    state.formState.timeseries?.[index]?.watlevmp,
    state.setState,
    state.deleteState,
  ]);

  const id = `timeseries.${index}.watlevmp`;
  const show = watlevmp !== undefined;

  return (
    // <Box display={'flex'} flexDirection="row" alignItems={'start'}>

    <FormFieldset label="Målepunkt" labelPosition={-12} sx={{width: '100%', px: 1, py: 0}}>
      {/* <Typography color="grey.700">Målepunkt</Typography> */}

      {show ? (
        <>
          <Button
            bttype="tertiary"
            startIcon={<RemoveCircleOutline color="primary" />}
            sx={{
              width: 'fit-content',
              borderWidth: 0,
            }}
            onClick={() => {
              deleteState(`timeseries.${index}.watlevmp`);
            }}
          >
            <Typography variant="body1" color="primary">
              Registrer senere
            </Typography>
          </Button>

          <WatlevmpForm
            id={id}
            intakeno={intakeno}
            values={watlevmp}
            setValues={(values) => setState(`timeseries.${index}.watlevmp`, values)}
          />
        </>
      ) : (
        <Box>
          <Button
            bttype="tertiary"
            startIcon={<AddCircleOutline color="primary" />}
            sx={{
              width: 'fit-content',
              borderWidth: 0,
            }}
            onClick={() => {
              setState(`timeseries.${index}.watlevmp`, {});
            }}
          >
            <Typography variant="body1" color="primary">
              Tilføj
            </Typography>
          </Button>
        </Box>
      )}
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
          px: 1,
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setState(`timeseries.${index}.watlevmp`, {});
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj målepunkt
        </Typography>
      </Button>
    </Box>
  );
};

export default WatlevmpSection;
