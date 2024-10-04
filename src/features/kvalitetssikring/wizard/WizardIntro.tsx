import {
  Box,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

interface WizardIntroProps {
  setValue: (value: number) => void;
}

const WizardIntro = ({setValue}: WizardIntroProps) => {
  const [radio, setRadio] = useState(0);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt((event.target as HTMLInputElement).value));
    setRadio(parseInt((event.target as HTMLInputElement).value));
  };

  return (
    <Box alignSelf={'center'} width={'inherit'} height={'inherit'} justifySelf={'center'}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
          justifyContent: 'space-between',
          alignContent: 'center',
        }}
      >
        <Box display={'flex'} flexDirection="column" mb={3} justifyContent={'center'} gap={1}>
          <Typography variant="h5" fontWeight={'bold'} alignSelf={'center'}>
            Datajustering
          </Typography>
          <Typography>
            Denne guide er lavet med henblik på at hjælpe dig med at kvalitetssikre.
          </Typography>
          Du har hermed følgende muligheder. Vælg venligst hvilken du gerne vil fortsætte med og
          tryk på næste.
          <Typography></Typography>
        </Box>
        <Box display={'flex'} flexDirection="column" mb={3} alignSelf={'center'}>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={radio}
              onChange={handleChange}
            >
              <FormControlLabel
                value={1}
                control={<Radio />}
                label="Markere tidsserie som godkendt"
              />
              <FormControlLabel
                value={2}
                control={<Radio />}
                label="Fjern punkter fra tidsserien"
              />
              <FormControlLabel
                value={3}
                control={<Radio />}
                label="Definere øvre og nedre grænser på tidsserien"
              />
              <FormControlLabel value={4} control={<Radio />} label="Korriger spring" />
            </RadioGroup>
          </FormControl>
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardIntro;
