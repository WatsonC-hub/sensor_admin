import {Controller} from 'react-hook-form';

import PhoneInput from '../PhoneInput';

import type {PhoneInputProps} from '../PhoneInput';
import type {Control, FieldValues, Path, RegisterOptions} from 'react-hook-form';

type FormPhoneInputProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  fullWidth: boolean;
  rules?:
    | Omit<RegisterOptions<T, Path<T>>, 'setValueAs' | 'disabled' | 'valueAsNumber' | 'valueAsDate'>
    | undefined;
} & PhoneInputProps;

export function FormPhoneInput<T extends FieldValues>({
  name,
  control,
  rules,
  placeholder,
  fullWidth = true,
  ...props
}: FormPhoneInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({field: {value, onChange}, fieldState: {error}}) => (
        <PhoneInput
          value={value ?? ''}
          onChange={(value) => {
            console.log('value', value);
            onChange(value);
          }}
          error={!!error}
          helperText={error?.message}
          placeholder={placeholder}
          fullWidth={fullWidth}
          {...props}
        />
      )}
    />
  );
}
