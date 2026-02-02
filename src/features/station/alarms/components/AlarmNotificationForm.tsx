import React from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmsFormValues} from '../schema';
import {useFormContext} from 'react-hook-form';
import {Box, Chip, Typography} from '@mui/material';
import {getColor} from '~/features/notifications/utils';
import {FlagEnum, sensorColors} from '~/features/notifications/consts';
import SouthIcon from '@mui/icons-material/South';
import {useNotificationTypes, type NotificationType} from '~/hooks/query/useNotificationOverview';
import Button from '~/components/Button';

const AlarmNotificationTypedForm = createTypedForm<AlarmsFormValues>();

const AlarmNotificationForm = () => {
  const {setValue, watch} = useFormContext<AlarmsFormValues>();
  const Notification_ids = watch('notification_ids');

  const {data} = useNotificationTypes();

  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'} gap={1}>
      <Box display={'flex'} flexDirection={'row'} gap={1} alignItems="center" flexWrap={'wrap'}>
        <Button
          bttype="tertiary"
          sx={{
            padding: '0 8px',
            textTransform: 'initial',
            backgroundColor: sensorColors[FlagEnum.CRITICAL].color,
            color: 'white',
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
          bttype="tertiary"
          sx={{
            padding: '0 8px',
            textTransform: 'initial',
            backgroundColor: sensorColors[FlagEnum.WARNING].color,
            borderColor: sensorColors[FlagEnum.WARNING].color,
            color: 'white',
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
          bttype="tertiary"
          sx={{
            padding: '0 8px',
            textTransform: 'initial',
            backgroundColor: sensorColors[FlagEnum.INFO].color,
            borderColor: sensorColors[FlagEnum.INFO].color,
            color: 'white',
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
        <Typography variant="body2">← tilføj notifikationer</Typography>
      </Box>
      <AlarmNotificationTypedForm.Autocomplete<NotificationType, true>
        options={data ?? []}
        valueKey="gid"
        labelKey="name"
        name="notification_ids"
        multiple
        fullWidth
        gridSizes={12}
        textFieldsProps={{
          label: 'Notifikationer',
          placeholder: 'Søg og vælg notifikation...',
          required: true,
        }}
        // onChangeCallback={(value) => {
        //   setValue(
        //     'notification_ids',
        //     value.map((v) => (typeof v === 'number' ? v : v.gid)),
        //     {shouldDirty: true}
        //   );
        //   trigger('notification_ids');
        // }}
        renderTags={(value, getTagProps) => {
          return value.map((option, index) => {
            const content = (
              <Typography display="inline" variant="body2">
                {option.name}
              </Typography>
            );

            return (
              <Chip
                variant="outlined"
                label={content}
                sx={{
                  backgroundColor: getColor({
                    flag: option.flag ?? 0,
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
              <Chip
                variant="outlined"
                label={option.name}
                sx={{
                  backgroundColor: getColor({
                    flag: option.flag ?? 0,
                  }),
                  color: 'HighlightText',
                  opacity: 0.8,
                }}
                component={'div'}
              />
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
