import {Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio} from '@mui/material';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import {correction_map} from '~/consts';

const Correction = () => {
  const {control} = useFormContext();
  return (
    <Grid item xs={12} sm={12}>
      <Controller
        control={control}
        name="useforcorrection"
        rules={{required: true}}
        render={({field}) => {
          return (
            <FormControl component="fieldset">
              <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>
              <RadioGroup value={field.value + ''} onChange={field.onChange}>
                <FormControlLabel value="0" control={<Radio />} label="Kontrol" />
                <FormControlLabel value="1" control={<Radio />} label="Korrektion fremadrettet" />
                <FormControlLabel
                  value="-1"
                  control={<Radio />}
                  label="Korrektion bagud og fremadrettet"
                />
                {['-1', '2', '4', '5', '6'].includes(field.value.toString()) && (
                  <>
                    {Object.keys(correction_map)
                      .filter((x) => !['0', '1', '3'].includes(x.toString()))
                      .map((element, index) => {
                        const value = Object.values(correction_map).filter(
                          (x) => !['Kontrol', 'Korrektion fremadrettet', 'Lineær'].includes(x)
                        )[index];
                        return (
                          <FormControlLabel
                            key={element}
                            value={element}
                            control={<Radio />}
                            label={value}
                            sx={{ml: 2}}
                          />
                        );
                      })}
                  </>
                )}
              </RadioGroup>
            </FormControl>
          );
        }}
      />
    </Grid>
  );
};

export default Correction;
