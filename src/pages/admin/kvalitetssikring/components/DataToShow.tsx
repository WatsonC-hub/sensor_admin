// Component with a list of checkboces to select which data to show

import {Box, FormControlLabel, FormGroup, Switch, Typography} from '@mui/material';
import {useAtom} from 'jotai';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {dataToShowAtom} from '~/state/atoms';

export default function DataToShow() {
  const [dataToShow, setDataToShow] = useAtom(dataToShowAtom);
  const {isMobile} = useBreakpoints();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataToShow({...dataToShow, [event.target.name]: event.target.checked});
  };

  return (
    <FormGroup row={isMobile} sx={{ml: 2, justifyContent: 'space-around'}}>
      {Object.keys(dataToShow).map((key) => (
        <Box key={key} width={isMobile ? '50%' : '100%'}>
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={Object.entries(dataToShow).find((item) => item[0] === key)?.[1] === true}
                onChange={handleChange}
                name={key}
                size="small"
                color="primary"
              />
            }
            label={<Typography variant="caption">{key}</Typography>}
          />
        </Box>
      ))}
    </FormGroup>
  );
}
