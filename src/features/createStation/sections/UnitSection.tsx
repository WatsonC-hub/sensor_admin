import React from 'react';
import {Box, IconButton, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import Button from '~/components/Button';
import UnitForm from '../forms/UnitForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

type UnitStepProps = {
  uuid: string;
  tstype_id: number;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const UnitSection = ({uuid, show, setShow, tstype_id}: UnitStepProps) => {
  const {isMobile} = useBreakpoints();
  const [unit, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[uuid].unit,
    state.setState,
    state.deleteState,
  ]);
  const id = `timeseries.${uuid}.unit`;

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
                deleteState(`timeseries.${uuid}.unit`);
              }}
            >
              <RemoveCircleOutline />
            </IconButton>
            <UnitForm
              id={id}
              unit={unit}
              setValues={(values) => setState(`timeseries.${uuid}.unit`, values)}
              tstype_id={tstype_id}
            />
          </>
        )}
      </Box>
    </FormFieldset>
  );
};

export default UnitSection;
