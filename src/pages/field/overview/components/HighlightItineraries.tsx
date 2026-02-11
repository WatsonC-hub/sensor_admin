import {Autocomplete, Chip, TextField, Typography} from '@mui/material';
import React, {useCallback} from 'react';
import {Noop} from 'react-hook-form';
import {ItineraryColors} from '~/features/notifications/consts';
import {useItineraries} from '~/features/tasks/api/useItinerary';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Taskitinerary} from '~/features/tasks/types';
import {SimpleItinerary} from '~/types';

type Props = {
  value: Array<SimpleItinerary> | undefined | null;
  setValue: (value: Array<SimpleItinerary>) => void;
  onBlur?: Noop;
  label?: string;
};

const HighlightItineraries = ({setValue, value, onBlur, label = 'Itineraries'}: Props) => {
  const {
    getUsers: {data: users},
  } = useTasks();
  const {data: options} = useItineraries({
    select: useCallback(
      (data: Taskitinerary[]) =>
        data.map((itinerary) => ({
          name: itinerary.name,
          id: itinerary.id,
          assigned_to_name:
            users?.find((user) => user.id === itinerary.assigned_to)?.display_name ?? '',
          due_date: itinerary.due_date ?? '',
        })) as SimpleItinerary[],
      [users]
    ),
  });

  return (
    // <TooltipWrapper description="Fremhæv ture på kortet ved at vælge dem her. Dette indikeres ved en farvet cirkel i toppen af prikken på kortet som matcher farven på den valgte tur her i listen.">
    <Autocomplete
      sx={{
        marginTop: '8px',
        marginBottom: '4px',
        pb: 1.5,
      }}
      freeSolo
      forcePopupIcon={false}
      multiple
      fullWidth
      value={value?.filter((item) => options?.map((option) => option.id).includes(item.id)) ?? []}
      autoHighlight={true}
      onChange={(event, newValue) => {
        setValue(
          newValue.map((item) => {
            if (typeof item === 'string') {
              return {name: item, id: '', assigned_to_name: '', due_date: ''};
            }
            return item;
          })
        );
      }}
      id="tags-standard"
      options={options || []}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }

        return `${option.name ? option.name + ' - ' : ''}${
          option.assigned_to_name ? `(${option.assigned_to_name})` : ''
        }${option.due_date ? ` - ${option.due_date}` : ''}`;
        // return `${option.id.slice(0, 4)} - ${option.group_name}`;
      }}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => {
          const content = (
            <Typography display="inline" variant="body2">
              {option.name ? option.name + ' - ' : ''}
              {option.assigned_to_name ? ` ${option.assigned_to_name} -` : ''}
              {option.due_date ? ` ${option.due_date}` : ''}
            </Typography>
          );

          return (
            <Chip
              variant="outlined"
              label={content}
              sx={{
                backgroundColor: ItineraryColors[index],
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
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Typography display="inline" variant="body2">
            {option.name ? option.name + ' - ' : ''}
            {option.assigned_to_name ? ` ${option.assigned_to_name} -` : ''}
            {option.due_date ? ` ${option.due_date}` : ''}
          </Typography>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          InputLabelProps={{shrink: true}}
          variant="outlined"
          label={label}
          placeholder="Vælg tur(e)"
          onBlur={onBlur}
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
            '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
            '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
            '& .MuiOutlinedInput-root': {
              '& > fieldset': {borderColor: 'primary.main'},
            },
          }}
        />
      )}
      filterSelectedOptions
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
    />
    // </TooltipWrapper>
  );
};

export default HighlightItineraries;
