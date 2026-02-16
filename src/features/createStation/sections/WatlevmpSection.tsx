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
  const {isMobile} = useBreakpoints();
  const [intakeno, watlevmp, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index]?.meta?.intakeno,
    state.formState.timeseries?.[index]?.watlevmp,
    state.setState,
    state.deleteState,
  ]);

  const id = `timeseries.${index}.watlevmp`;
  const show = watlevmp !== undefined;

  if (show)
    return (
      <Box display={'flex'} flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState(`timeseries.${index}.watlevmp`);
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
                startIcon={<RemoveCircleOutline color="primary" fontSize="small" />}
                onClick={() => {
                  deleteState(`timeseries.${index}.watlevmp`);
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Målepunkt
                </Typography>
              </Button>
            ) : (
              'Målepunkt'
            )
          }
          labelPosition={isMobile ? -22 : -20}
          sx={{width: '100%', p: 1}}
        >
          <WatlevmpForm
            id={id}
            intakeno={intakeno}
            values={watlevmp}
            setValues={(values) => setState(`timeseries.${index}.watlevmp`, values)}
          />
        </FormFieldset>
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
