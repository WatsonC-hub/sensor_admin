import {Grid2, GridBaseProps} from '@mui/material';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {FormContext} from './const';
import ExtendedAutocomplete, {AutoCompleteFieldProps} from '../Autocomplete';

type FormAutocompleteProps<T extends FieldValues, K extends object> = {
  name: Path<T>;
  label: string;
  gridSizes?: GridBaseProps['size'];
  icon?: React.ReactNode;
  onChangeCallback?: (value: keyof K | null) => void;
  onSelectChange: (value: keyof K) => K | null;
} & Omit<AutoCompleteFieldProps<K>, 'selectValue' | 'onChange'>;

const FormAutocomplete = <T extends FieldValues, K extends object>({
  name,
  gridSizes,
  onChangeCallback,
  onSelectChange,
  ...props
}: FormAutocompleteProps<T, K>) => {
  const {control} = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  return (
    <Grid2 size={gridSizes ?? contextGridSizes}>
      <Controller
        name={name}
        control={control}
        render={({field}) => {
          return (
            <ExtendedAutocomplete<K>
              selectValue={onSelectChange(field.value as keyof K)}
              onChange={(value) => {
                field.onChange(value);

                if (onChangeCallback && value && 'id' in value)
                  onChangeCallback(value.id as keyof K);
              }}
              {...props}
            />
          );
        }}
      />
    </Grid2>
  );
};

export default FormAutocomplete;
