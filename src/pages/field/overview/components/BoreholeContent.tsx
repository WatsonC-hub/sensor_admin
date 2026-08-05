import {Directions} from '@mui/icons-material';
import {Box, Chip, Grid, IconButton, Link, Typography} from '@mui/material';

import {useFindBorehole} from '~/features/station/api/useBorehole';
import {convertDate} from '~/helpers/dateConverter';
import {getGroupLink} from '~/helpers/links';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useAppContext} from '~/state/contexts';

import BoreholeIcon from './BoreholeIcon';

const BoreholeContent = () => {
  const {boreholeno} = useAppContext(['boreholeno']);
  const {boreholeIntake} = useNavigationFunctions();

  const {data, isLoading} = useFindBorehole(boreholeno);

  if (isLoading || !data) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          py: 3,
          px: 2,
          gap: 3,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: -2,
            gap: 0.5,
          }}
        >
          <Typography
            variant={'h6'}
            sx={{
              fontWeight: 'bold',
            }}
          >
            {boreholeno}
          </Typography>
          <Typography
            variant={'body2'}
            sx={{
              minHeight: 24,
              alignContent: 'center',
            }}
          >
            Indlæser...
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
          }}
        >
          {/* <TooltipWrapper description=""> */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
              }}
            >
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
          <Typography
            variant={'body2'}
            sx={{
              minHeight: 24,
              alignContent: 'center',
            }}
          >
            Indlæser...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        py: 3,
        px: 2,
        gap: 1,
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: -2,
        }}
      >
        <Typography
          variant={'h6'}
          sx={{
            fontWeight: 'bold',
          }}
        >
          {boreholeno}
        </Typography>
        {data.description && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant={'body2'}
              sx={{
                minHeight: 24,
                alignContent: 'center',
              }}
            >
              Beskrivelse:{' '}
            </Typography>
            <Typography
              variant={'body2'}
              sx={{
                minHeight: 24,
                alignContent: 'center',
              }}
            >
              {data.description}
            </Typography>
          </Box>
        )}
        {data.plantname && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography
              variant={'body2'}
              sx={{
                height: 24,
                alignContent: 'center',
              }}
            >
              Anlæg:
            </Typography>
            <Typography
              variant={'body2'}
              sx={{
                minHeight: 24,
                alignContent: 'center',
              }}
            >
              {data.plantname} ({data.plantid})
            </Typography>
          </Box>
        )}
        {data.drilldepth && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant={'body2'}
              sx={{
                minHeight: 24,
                alignContent: 'center',
              }}
            >
              Borings dybde:
            </Typography>
            <Typography
              variant={'body2'}
              sx={{
                minHeight: 24,
                alignContent: 'center',
              }}
            >
              {data.drilldepth} m
            </Typography>
          </Box>
        )}
        {data?.groups && data?.groups.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant={'body2'}
              sx={{
                alignContent: 'center',
              }}
            >
              Grupper:
            </Typography>
            <Grid
              container
              sx={{
                gap: 0.25,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end',
              }}
            >
              {data.groups.map((group) => {
                return (
                  <Grid
                    size={undefined}
                    key={group.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}
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
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexDirection: 'column',
        }}
      >
        {/* <TooltipWrapper description=""> */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
            }}
          >
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
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <BoreholeIcon
                    iconDetails={{
                      status: [data.status[index]],
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 'small',
                      width: 'fit-content',
                    }}
                  >
                    <Link onClick={() => boreholeIntake(data.boreholeno, intake)}>
                      Indtag {intake}
                    </Link>
                  </Typography>
                </Box>
                {data.measurement[index] !== null && data.timeofmeas[index] !== null && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      color: 'grey.700',
                    }}
                  >
                    <Typography variant="caption">Seneste:</Typography>
                    <Typography variant="caption">{data.measurement[index]} m</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        alignContent: 'center',
                        color: 'grey.700',
                      }}
                    >
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
