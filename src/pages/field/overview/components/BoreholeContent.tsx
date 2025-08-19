import {Box, Chip, Grid2, IconButton, Link, Typography} from '@mui/material';

import {useSearchBorehole} from '~/features/station/api/useBorehole';
import {getGroupLink} from '~/helpers/links';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useAppContext} from '~/state/contexts';
import BoreholeIcon from './BoreholeIcon';
import {convertDate} from '~/helpers/dateConverter';
import {Directions} from '@mui/icons-material';

const BoreholeContent = () => {
  const {boreholeno} = useAppContext(['boreholeno']);
  const {boreholeIntake} = useNavigationFunctions();

  const {data: boreholes} = useSearchBorehole(boreholeno);
  const data = boreholes?.find((borehole) => borehole.boreholeno === boreholeno);

  if (data === undefined) {
    return (
      <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3} overflow="auto">
        <Box display={'flex'} flexDirection={'column'} mt={-2} gap={0.5}>
          <Typography variant={'h6'} fontWeight={'bold'}>
            {boreholeno}
          </Typography>
          <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
            Indlæser...
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexDirection={'column'}>
          {/* <TooltipWrapper description=""> */}
          <Box
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant="h6" fontWeight={'bold'}>
              Indtag
            </Typography>
            <IconButton
              disabled={true}
              sx={{
                color: 'primary.main',
              }}
            >
              <Directions />
            </IconButton>
          </Box>
          <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
            Indlæser...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={1} overflow="auto">
      <Box display={'flex'} flexDirection={'column'} mt={-2}>
        <Typography variant={'h6'} fontWeight={'bold'}>
          {boreholeno}
        </Typography>
        {data.description && (
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
            <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
              Beskrivelse:{' '}
            </Typography>
            <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
              {data.description}
            </Typography>
          </Box>
        )}
        {data.plantname && (
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} gap={1}>
            <Typography variant={'body2'} height={24} alignContent={'center'}>
              Anlæg:
            </Typography>
            <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
              {data.plantname} ({data.plantid})
            </Typography>
          </Box>
        )}
        {data.drilldepth && (
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
            <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
              Borings dybde:
            </Typography>
            <Typography variant={'body2'} minHeight={24} alignContent={'center'}>
              {data.drilldepth} m
            </Typography>
          </Box>
        )}
        {data?.groups && data?.groups.length > 0 && (
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
            <Typography variant={'body2'} alignContent={'center'}>
              Grupper:
            </Typography>
            <Grid2
              container
              gap={0.25}
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'end'}
            >
              {data.groups.map((group) => {
                return (
                  <Grid2
                    size={undefined}
                    display={'flex'}
                    flexDirection={'row'}
                    justifyContent={'flex-end'}
                    key={group.id}
                  >
                    <Chip
                      variant="outlined"
                      size="small"
                      label={
                        <Link href={getGroupLink(group.id)} key={group.id}>
                          {group.group_name}
                        </Link>
                      }
                    />
                  </Grid2>
                );
              })}
            </Grid2>
          </Box>
        )}
      </Box>
      <Box display="flex" gap={1} flexDirection={'column'}>
        {/* <TooltipWrapper description=""> */}
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography variant="h6" fontWeight={'bold'}>
            Indtag
          </Typography>
          <IconButton
            disabled={!data.latitude || !data.longitude}
            onClick={() => {
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`,
                '_blank'
              );
            }}
            sx={{
              color: 'primary.main',
            }}
          >
            <Directions />
          </IconButton>
        </Box>
        {data.intakeno.map((intake, index) => {
          return (
            <>
              <Box key={index} display="flex" justifyContent={'space-between'} alignItems="center">
                <Box display="flex" gap={1} sx={{cursor: 'pointer'}}>
                  <BoreholeIcon
                    iconDetails={{
                      status: [data.status[index]],
                    }}
                  />
                  <Typography fontSize={'small'} width={'fit-content'}>
                    <Link onClick={() => boreholeIntake(data.boreholeno, intake)}>
                      Indtag {intake}
                    </Link>
                  </Typography>
                </Box>
                {data.measurement[index] !== null && data.timeofmeas[index] !== null && (
                  <Box display="flex" gap={1} color="grey.700">
                    <Typography variant="caption">Seneste:</Typography>
                    <Typography variant="caption">{data.measurement[index]} m</Typography>
                    <Typography variant="caption" alignContent={'center'} color="grey.700">
                      {convertDate(data.timeofmeas[index])}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          );
        })}
      </Box>
    </Box>
  );
};

export default BoreholeContent;
