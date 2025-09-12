import React from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmsFormValues} from '../schema';
import {useFormContext} from 'react-hook-form';
import useNotificationType, {NotificationType} from '~/hooks/query/useNotificationTypes';
import {Box, ButtonGroup, Chip, Typography, Button} from '@mui/material';
import {getColor} from '~/features/notifications/utils';
import {FlagEnum, sensorColors} from '~/features/notifications/consts';
import SouthIcon from '@mui/icons-material/South';

const AlarmNotificationTypedForm = createTypedForm<AlarmsFormValues>();

const AlarmNotificationForm = () => {
  const {setValue, watch, trigger} = useFormContext<AlarmsFormValues>();
  const Notification_ids = watch('notification_ids');

  const {
    get: {data},
  } = useNotificationType();

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
              setValue(
                'notification_ids',
                [
                  ...new Set([
                    ...Notification_ids,
                    ...(data
                      ?.filter((item) => item.flag === FlagEnum.CRITICAL)
                      .map((item) => item.gid) ?? []),
                  ]),
                ],
                {shouldDirty: true}
              );
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
              setValue(
                'notification_ids',
                [
                  ...new Set([
                    ...Notification_ids,
                    ...(data
                      ?.filter((item) => item.flag === FlagEnum.WARNING)
                      .map((item) => item.gid) ?? []),
                  ]),
                ],
                {shouldDirty: true}
              );
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
              const alarmNotificationArray = [
                ...new Set([
                  ...Notification_ids,
                  ...(data?.filter((item) => item.flag === FlagEnum.INFO).map((item) => item.gid) ??
                    []),
                ]),
              ];
              setValue('notification_ids', alarmNotificationArray, {shouldDirty: true});
            }}
            endIcon={<SouthIcon sx={{width: '16px'}} />}
          >
            Ukritisk
          </Button>
        </ButtonGroup>
      </Box>
      <AlarmNotificationTypedForm.Autocomplete<NotificationType, true>
        options={data ?? []}
        labelKey="name"
        name="notification_ids"
        multiple={true}
        label={`Notifikationer`}
        fullWidth
        gridSizes={12}
        textFieldsProps={{
          label: 'Notifikationer',
          placeholder: 'Søg og vælg notifikation...',
          required: true,
        }}
        getOptionLabel={(o) => {
          if (!o) return '';

          if (typeof o === 'string') {
            return data?.find((item) => item.gid === o)?.name ?? '';
          }

          return o ? (o.name ?? '') : '';
        }}
        onChangeCallback={(value) => {
          setValue(
            'notification_ids',
            value.map((v) => (typeof v === 'number' ? v : v.gid)),
            {shouldDirty: true}
          );
          trigger('notification_ids');
        }}
        renderTags={(value, getTagProps) => {
          return value.map((option, index) => {
            const gid = typeof option === 'number' ? option : option.gid;
            const content = (
              <Typography display="inline" variant="body2">
                {data?.find((item) => item.gid === gid)?.name}
              </Typography>
            );

            return (
              <Chip
                variant="outlined"
                label={content}
                sx={{
                  backgroundColor: getColor({
                    flag: data?.find((item) => item.gid === gid)?.flag ?? 0,
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
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.gid}>
              <Typography display="inline" variant="body2">
                {option.name}
              </Typography>
            </li>
          );
        }}
        filterSelectedOptions
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
      />
    </Box>
  );
};

export default AlarmNotificationForm;
