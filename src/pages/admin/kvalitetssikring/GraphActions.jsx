import BackspaceIcon from '@mui/icons-material/Backspace';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {Box, Tooltip} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import GraphActionModal from '~/pages/admin/kvalitetssikring/GraphActionModal';
import GraphButton from '~/pages/admin/kvalitetssikring/GraphButton';
import {qaSelection} from '~/state/atoms';

const GraphActions = () => {
  const selectedData = useAtomValue(qaSelection);
  const [openModal, setOpenModal] = React.useState('');

  const isDisabled = Object.keys(selectedData).length === 0 || selectedData.points.length === 0;
  const isOnlyOnePoint = selectedData?.points?.length === 1;

  return (
    <>
      <Box
        bgcolor="secondary.main" // Use your secondary background color
        borderRadius={4} // Adjust the radius as needed
        border={2}
        borderColor={'primary.main'}
        padding={2} // Add padding to the toolbar
        display="flex"
        justifyContent="center"
        alignItems="center"
        // gap={8}
        // width={'80%'}
        alignSelf={'center'}
      >
        <Tooltip
          title={isDisabled ? 'ℹ️ Vælg punkter med værktøj først' : ''}
          enterTouchDelay={0}
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'info.main',
                color: 'white',
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <GraphButton
              icon={<BackspaceIcon />}
              disabled={isDisabled}
              onClick={() => setOpenModal('exclude')}
              infotext={'Marker punkter som skal fjernes fra grafen'}
            >
              Fjern punkter
            </GraphButton>
            <GraphButton
              disabled={isDisabled}
              icon={<DensityLargeIcon />}
              onClick={() => setOpenModal('yrange')}
              infotext={'Brug box værktøj til at definere et y-interval som skal være gyldigt'}
            >
              Valide værdier
            </GraphButton>
            <GraphButton
              enableTooltip={!isDisabled}
              disabled={isDisabled || !isOnlyOnePoint}
              icon={
                <ShowChartIcon
                  sx={{
                    transform: 'rotate(45deg)',
                  }}
                />
              }
              onClick={() => setOpenModal('level_correction')}
              infotext={
                'Vælg ét punkt som bliver korrigeret til at have samme værdi som det forrige punkt'
              }
            >
              Korriger spring
            </GraphButton>
          </Box>
        </Tooltip>
      </Box>

      <GraphActionModal modal={openModal} closeModal={() => setOpenModal('')} />
    </>
  );
};

export default GraphActions;
