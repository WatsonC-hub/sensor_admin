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
        display="flex"
        justifyContent="center"
        alignItems="center"
        // gap={8}
        // width={'80%'}
        alignSelf={'center'}
      >
        <Tooltip
          title={
            isDisabled
              ? 'ℹ️ Anvend først "Markere punkter" knappen før du kan bruge disse knapper'
              : ''
          }
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
              bttype={'primary'}
              disabled={isDisabled}
              onClick={() => setOpenModal('exclude')}
              infotext={'Brug denne knap for at fjerne de markerede punkter på grafen'}
            >
              Fjern punkter
            </GraphButton>
            <GraphButton
              disabled={isDisabled}
              bttype={'primary'}
              icon={<DensityLargeIcon />}
              onClick={() => setOpenModal('yrange')}
              infotext={'Brug denne knap for at markere y-intervallet som gyldigt'}
            >
              Valide værdier
            </GraphButton>
            <GraphButton
              enableTooltip={!isDisabled}
              bttype={'primary'}
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
                'Det vælgte punkt vil blive korrigeret til at have samme værdi som det forrige punkt'
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
