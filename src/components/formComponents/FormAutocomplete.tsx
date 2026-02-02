import {Grid2, GridBaseProps} from '@mui/material';
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {FormContext} from './const';
import ExtendedAutocomplete, {AutoCompleteFieldProps} from '../Autocomplete';

type FormAutocompleteProps<T extends FieldValues, K extends object, M extends boolean = false> = {
  name: Path<T>;
  gridSizes?: GridBaseProps['size'];
  valueKey: keyof K;
  icon?: React.ReactNode;
  onChangeCallback?: (value: M extends true ? K[] : K) => void;
} & Omit<AutoCompleteFieldProps<K, M>, 'selectValue' | 'onChange'>;

const FormAutocomplete = <T extends FieldValues, K extends object, M extends boolean = false>({
  name,
  gridSizes,
  onChangeCallback,
  options,
  valueKey,
  labelKey,
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
          let selectValue = (props.multiple ? ([] as K[]) : null) as M extends true
            ? K[]
            : K | null;
          if (Array.isArray(value)) {
            selectValue = options.filter((o) => value.includes(o[valueKey])) as M extends true
              ? K[]
              : K | null;
          } else {
            selectValue = (options.find((o) => o[valueKey] === value) ?? '') as M extends true
              ? K[]
              : K | null;
          }

          return (
            <ExtendedAutocomplete<K, M>
              selectValue={selectValue}
              error={errors[name]?.message as string | undefined}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  onChange((value as K[]).map((v) => v[valueKey]));
                } else {
                  onChange(value ? (value as K)[valueKey] : null);
                }
                if (onChangeCallback) onChangeCallback(value as M extends true ? K[] : K);
              }}
              options={options}
              labelKey={labelKey}
              {...props}
            />
          );
        }}
      />
    </Grid2>
  );
};

export default FormAutocomplete;
