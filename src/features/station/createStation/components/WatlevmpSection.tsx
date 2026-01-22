import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import {Box, Typography, IconButton, Grid2} from '@mui/material';
import React from 'react';
import WatlevmpForm from '../forms/WatlevmpForm';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useAggregateController} from '../controller/useAggregateController';
import {TimeseriesPayload} from '../controller/types';

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  controller: ReturnType<typeof useAggregateController<TimeseriesPayload>>;
};

const WatlevmpSection = ({show, setShow, controller}: Props) => {
  const {isMobile} = useBreakpoints();
  const tstype_id = controller.getSlices()['meta']?.value?.tstype_id;
  const intakeno = controller.getSlices()['meta']?.value?.intakeno;

  if (show)
    return (
      <FormFieldset
        label={
          isMobile ? (
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                setShow(false);
                controller.unregisterSlice('watlevmp');
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
                    controller.unregisterSlice('watlevmp');
                  }}
                >
                  <RemoveCircleOutline />
                </IconButton>
              )}
            </Grid2>
            <Grid2 size={11}>
              <WatlevmpForm
                tstype_id={tstype_id!}
                intakeno={intakeno ?? undefined}
                controller={controller}
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
          px: 0.5,
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
