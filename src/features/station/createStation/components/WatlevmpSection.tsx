import {Delete, AddCircleOutline} from '@mui/icons-material';
import {Grid2, Box, Typography} from '@mui/material';
import React from 'react';
import WatlevmpForm from './WatlevmpForm';
import useCreateStationContext from '../api/useCreateStationContext';
import useBreakpoints from '~/hooks/useBreakpoints';
import Button from '~/components/Button';
import {FieldArrayWithId} from 'react-hook-form';
import {FormState} from '~/helpers/CreateStationContextProvider';

type Props = {
  showAddWatlevmpButton: boolean;
  index: number;
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>;
  removeWatlevmpAtIndex: (index: number) => void;
  setWatlevmpIndex: React.Dispatch<React.SetStateAction<Array<number>>>;
};

const WatlevmpSection = ({
  showAddWatlevmpButton,
  index,
  field,
  removeWatlevmpAtIndex,
  setWatlevmpIndex,
}: Props) => {
  const {onValidate} = useCreateStationContext();
  const {isMobile} = useBreakpoints();

  return (
    <>
      {!showAddWatlevmpButton ? (
        <Grid2
          container
          size={12}
          display={isMobile ? 'flex' : undefined}
          justifyContent={isMobile ? 'end' : undefined}
        >
          <WatlevmpForm
            index={index}
            tstype_id={field.tstype_id!}
            intakeno={field.intakeno ?? undefined}
            onValidate={onValidate}
          />

          <Button
            bttype="tertiary"
            startIcon={<Delete />}
            sx={{height: 'fit-content', alignSelf: 'center', ml: 1}}
            onClick={() => {
              removeWatlevmpAtIndex(index);
            }}
          >
            Fjern målepunkt
          </Button>
        </Grid2>
      ) : (
        <Box display={isMobile ? 'flex' : undefined} justifyContent={isMobile ? 'end' : undefined}>
          <Button
            bttype="primary"
            sx={{
              width: 'fit-content',
              backgroundColor: 'transparent',
              border: 'none',
              ':hover': {
                backgroundColor: 'grey.200',
              },
            }}
            onClick={() => {
              setWatlevmpIndex((prev) => [...prev, index]);
            }}
          >
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="body1" color="primary">
                Tilføj målepunkt
              </Typography>
              <AddCircleOutline color="primary" />
            </Box>
          </Button>
        </Box>
      )}
    </>
  );
};

export default WatlevmpSection;
