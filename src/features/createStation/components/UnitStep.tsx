import React from 'react';
import {Box, IconButton, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import Button from '~/components/Button';
import {TimeseriesController, TimeseriesPayload} from '../controller/types';
import UnitForm from '../forms/UnitForm';

type UnitStepProps = {
  tstype_id: number;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  controller: TimeseriesController;
};

const UnitStep = ({show, setShow, tstype_id, controller}: UnitStepProps) => {
  const [openUnitDialog, setOpenUnitDialog] = React.useState(false);
  const [isUnitSelected, setIsUnitSelected] = React.useState(false);
  const {isMobile} = useBreakpoints();
  const unit = controller.getValues().unit;

  if (!show)
    return (
      <Box>
        <Button
          bttype="primary"
          startIcon={<AddCircleOutline color="primary" />}
          sx={{
            width: 'fit-content',
            backgroundColor: 'transparent',
            px: 0.5,
            border: 'none',
            ':hover': {
              backgroundColor: 'grey.200',
            },
          }}
          onClick={() => {
            if (!isUnitSelected) setOpenUnitDialog(true);
            setShow(true);
          }}
        >
          <Typography variant="body1" color="primary">
            Tilføj udstyr
          </Typography>
        </Button>
      </Box>
    );

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
              controller.unregisterSlice('unit');
              setIsUnitSelected(false);
            }}
          >
            <Typography variant="body2" color="grey.700">
              Udstyr
            </Typography>
          </Button>
        ) : (
          'Udstyr'
        )
      }
      labelPosition={isMobile ? -22 : -20}
      sx={{width: '100%', p: 1}}
    >
      <Box display="flex" flexDirection="row" gap={1}>
        {!isMobile && (
          <>
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setShow(false);
                controller.unregisterSlice('unit');
                setIsUnitSelected(false);
              }}
            >
              <RemoveCircleOutline />
            </IconButton>
            <UnitForm
              setIsUnitSelected={setIsUnitSelected}
              tstype_id={tstype_id}
              onValidChange={(isValid, value) => {
                controller.updateSlice('unit', isValid, value);
              }}
              registerSlice={(id, required, validate) =>
                controller.registerSlice(id as keyof TimeseriesPayload, required, validate)
              }
              openUnitDialog={openUnitDialog}
              setOpenUnitDialog={setOpenUnitDialog}
              unit={unit}
            />
          </>
        )}
      </Box>
    </FormFieldset>
  );
};

export default UnitStep;
