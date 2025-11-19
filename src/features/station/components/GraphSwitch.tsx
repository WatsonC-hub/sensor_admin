import {Box, FormControlLabel, Switch, Typography} from '@mui/material';
import {useSetAtom} from 'jotai';
import React from 'react';
import Button from '~/components/Button';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {dataToShowAtom} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';
import {DataToShow} from '~/types';

interface GraphSwitchProps {
  dataToShow: Partial<DataToShow>;
  setIsOpen: () => void;
}

type DisableMap = {
  [key in keyof DataToShow]: boolean;
};

const GraphSwitch = ({dataToShow, setIsOpen}: GraphSwitchProps) => {
  const {ts_id, boreholeno} = useAppContext(['ts_id'], ['boreholeno']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {isMobile} = useBreakpoints();
  const setDataToShow = useSetAtom(dataToShowAtom);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = event.target;
    setDataToShow((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const items = Object.entries(dataToShow).map(([key, value]) => {
    if (key === 'Jupiter' && (boreholeno === undefined || metadata?.tstype_id !== 1)) {
      return null;
    }
    return {
      key: key,
      label: key,
      checked: value,
    };
  });

  const disableMap: Partial<DisableMap> = {
    Rådata: !!metadata?.calculated,
    'Fjernet data': !!metadata?.calculated,
    'Korrigerede spring': !!metadata?.calculated,
    'Valide værdier': !!metadata?.calculated,
    Godkendt: !!metadata?.calculated,
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        right: isMobile ? '8px' : '18px',
        width: '175px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        pl: '10px',
        py: '10px',
        mt: 0.5,
      }}
    >
      <Box px={0.5}>
        <TooltipWrapper description="Valg herunder hvilke elementer der skal vises i grafen" />
      </Box>

      {items
        .filter((item) => item !== null)
        .map((item) => (
          <Box key={item.key} mb={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={item.checked}
                  onChange={handleChange}
                  name={item.key}
                  disabled={disableMap[item.key as keyof DisableMap]}
                  size={'small'}
                  color="primary"
                />
              }
              label={<Typography variant="caption">{item.label}</Typography>}
            />
          </Box>
        ))}

      <Box display={'flex'} flexDirection={'row'} justifyContent={'end'} mt={1}>
        <Button
          sx={{display: 'flex', justifySelf: 'end', mr: 1, textTransform: 'initial'}}
          onClick={() => {
            setDataToShow({});
          }}
          bttype="tertiary"
        >
          Nulstil
        </Button>
        <Button
          sx={{display: 'flex', justifySelf: 'end', mr: 1, textTransform: 'initial'}}
          onClick={() => {
            setIsOpen();
          }}
          bttype="tertiary"
        >
          Luk
        </Button>
      </Box>
    </Box>
  );
};

export default GraphSwitch;
