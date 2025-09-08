import {Grid2, GridBaseProps} from '@mui/material';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {FormContext} from './const';
import ExtendedAutocomplete, {AutoCompleteFieldProps} from '../Autocomplete';

type FormAutocompleteProps<T extends FieldValues, K extends object, M extends boolean = false> = {
  name: Path<T>;
  label: string;
  gridSizes?: GridBaseProps['size'];
  icon?: React.ReactNode;
  onChangeCallback?: (value: M extends true ? K[] : K) => void;
  // onSelectChange: (value: M extends true ? Array<K> : K) => M extends true ? K[] : K | null;
} & Omit<AutoCompleteFieldProps<K, M>, 'selectValue' | 'onChange'>;

const FormAutocomplete = <T extends FieldValues, K extends object, M extends boolean = false>({
  name,
  gridSizes,
  onChangeCallback,
  // onSelectChange,
  ...props
}: FormAutocompleteProps<T, K, M>) => {
  const {
    control,
    formState: {errors},
  } = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  return (
    <Grid2 size={gridSizes ?? contextGridSizes}>
      <Controller
        name={name}
        control={control}
        render={({field: {value, onChange}}) => {
          return (
            <ExtendedAutocomplete<K, M>
              selectValue={value}
              error={errors[name]?.message as string | undefined}
              onChange={(value) => {
                onChange(value);
                if (onChangeCallback) onChangeCallback(value as M extends true ? K[] : K);
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
