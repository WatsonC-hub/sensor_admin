import React from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmsFormValues} from '../schema';
import {useFormContext} from 'react-hook-form';
import useNotificationType, {NotificationType} from '~/hooks/query/useNotificationTypes';
import {Box, ButtonGroup, Chip, Typography, Button} from '@mui/material';
import {getColor} from '~/features/notifications/utils';
import {FlagEnum, sensorColors} from '~/features/notifications/consts';
import SouthIcon from '@mui/icons-material/South';

const AlarmCriteriaTypedForm = createTypedForm<AlarmsFormValues>();

const AlarmCriteriaForm = () => {
  const {setValue, watch} = useFormContext<AlarmsFormValues>();
  const criteria = watch('criteria');

  const {
    get: {data},
  } = useNotificationType();

  if (data === undefined || data.length === 0) return null;

  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'} gap={1}>
      <Typography>Brug knapperne for hurtigt at tilføje alarmer</Typography>
      <Box display={'flex'} flexDirection={'row'}>
        <ButtonGroup variant="outlined" aria-label="Basic button group">
          <Button
            sx={{
              padding: '0 8px',
              textTransform: 'initial',
              backgroundColor: sensorColors[FlagEnum.CRITICAL].color,
              color: 'white',
              borderRadius: 2.5,
              borderColor: sensorColors[FlagEnum.CRITICAL].color,
            }}
            onClick={() => {
              setValue('criteria', [
                ...new Set([
                  ...criteria,
                  ...data.filter((item) => item.flag === FlagEnum.CRITICAL).map((item) => item.gid),
                ]),
              ]);
            }}
            endIcon={<SouthIcon sx={{width: '16px'}} />}
          >
            Kritisk
          </Button>
          <Button
            sx={{
              padding: '0 8px',
              textTransform: 'initial',
              backgroundColor: sensorColors[FlagEnum.WARNING].color,
              borderColor: sensorColors[FlagEnum.WARNING].color,
              color: 'white',
              borderRadius: 2.5,
            }}
            onClick={() => {
              setValue('criteria', [
                ...new Set([
                  ...criteria,
                  ...data.filter((item) => item.flag === FlagEnum.WARNING).map((item) => item.gid),
                ]),
              ]);
            }}
            endIcon={<SouthIcon sx={{width: '16px'}} />}
          >
            Opmærksom
          </Button>
          <Button
            sx={{
              padding: '0 8px',
              textTransform: 'initial',
              backgroundColor: sensorColors[FlagEnum.INFO].color,
              borderColor: sensorColors[FlagEnum.INFO].color,
              color: 'white',
              borderRadius: 2.5,
            }}
            onClick={() => {
              const criteriaArray = [
                ...new Set([
                  ...criteria,
                  ...data.filter((item) => item.flag === FlagEnum.INFO).map((item) => item.gid),
                ]),
              ];
              // console.log(criteriaArray);
              setValue('criteria', criteriaArray);
            }}
            endIcon={<SouthIcon sx={{width: '16px'}} />}
          >
            Ukritisk
          </Button>
        </ButtonGroup>
      </Box>
      <AlarmCriteriaTypedForm.Autocomplete<NotificationType, true>
        options={data}
        labelKey="name"
        name="criteria"
        multiple={true}
        label={`Notifikationer`}
        fullWidth
        gridSizes={12}
        onSelectChange={() => {
          return data.filter((o) => criteria.includes(o.gid));
        }}
        textFieldsProps={{
          label: 'Notifikationer',
          placeholder: 'Søg og vælg notifikation...',
          required: true,
        }}
        renderTags={(value, getTagProps) => {
          return value.map((option, index) => {
            const content = (
              <Typography display="inline" variant="body2">
                {data.find((item) => item.gid === option.gid)?.name}
              </Typography>
            );

            return (
              <Chip
                variant="outlined"
                label={content}
                sx={{
                  backgroundColor: getColor({
                    flag: data.find((item) => item.gid === option.gid)?.flag ?? 0,
                  }),
                  color: 'HighlightText',
                  opacity: 0.8,
                }}
                component={'div'}
                {...getTagProps({index})}
                key={index}
              />
            );
          });
        }}
        filterSelectedOptions
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
      />
    </Box>
  );
};

export default AlarmCriteriaForm;
