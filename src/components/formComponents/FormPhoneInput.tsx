import {Controller, Control, FieldValues, Path, RegisterOptions} from 'react-hook-form';
import PhoneInput, {PhoneInputProps} from '../PhoneInput';

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
