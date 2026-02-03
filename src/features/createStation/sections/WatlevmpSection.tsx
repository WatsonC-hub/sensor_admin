import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, Typography, IconButton, Grid2} from '@mui/material';
import React from 'react';
import WatlevmpForm from '../forms/WatlevmpForm';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  index: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const WatlevmpSection = ({show, setShow, index}: Props) => {
  const {isMobile} = useBreakpoints();
  const [intakeno, watlevmp, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index]?.meta?.intakeno,
    state.formState.timeseries?.[index]?.watlevmp,
    state.setState,
    state.deleteState,
  ]);

  const id = `timeseries.${index}.watlevmp`;

  if (show)
    return (
      <FormFieldset
        label={
          isMobile ? (
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" fontSize="small" />}
              onClick={() => {
                setShow(false);
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
        <Box display={'flex'} flexDirection="row" gap={1}>
          <Grid2 container size={12} alignItems={'center'}>
            <Grid2 size={0.5}>
              {!isMobile && (
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => {
                    setShow(false);
                    deleteState(`timeseries.${index}.watlevmp`);
                  }}
                >
                  <RemoveCircleOutline fontSize="small" />
                </IconButton>
              )}
            </Grid2>
            <Grid2 size={11}>
              <WatlevmpForm
                id={id}
                intakeno={intakeno}
                values={watlevmp}
                setValues={(values) => setState(`timeseries.${index}.watlevmp`, values)}
              />
            </Grid2>
          </Grid2>
        </Box>
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
          setShow(true);
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
