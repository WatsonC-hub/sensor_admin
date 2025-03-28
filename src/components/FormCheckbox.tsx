import {Checkbox, CheckboxProps, FormControlLabel} from '@mui/material';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';

type FormCheckboxProps<TFieldValues extends FieldValues> = CheckboxProps & {
  name: Path<TFieldValues>;
  warning?: (value: any) => string;
  children?: React.ReactNode;
  rules?: any;
  label: string;
  includeInderterminate?: boolean;
  onChangeCallback?: (value: any) => void;
};

const FormCheckbox = <TFieldValues extends FieldValues>({
  name,
  warning,
  rules,
  onChangeCallback,
  label,
  includeInderterminate = false,
  ...otherProps
}: FormCheckboxProps<TFieldValues>) => {
  const {control} = useFormContext<TFieldValues>();

  return (
    <FormControlLabel
      label={label}
      control={
        <Controller
          control={control}
          name={name}
          // defaultvalue={get(defaultValues, name) === undefined ? '' : get(defaultValues, name)}
          rules={rules}
          render={({field: {value, onChange, ref, name}}) => {
            return (
              <Checkbox
                {...otherProps}
                name={name}
                // checked={value === null ? false : value}
                value={value === null ? false : value}
                ref={ref}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#000000',
                  },
                  '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                  '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
                  '& .MuiOutlinedInput-root': {
                    '& > fieldset': {borderColor: 'primary.main'},
                  },
                  '.MuiFormHelperText-root': {color: warning && warning(value) ? 'orange' : 'red'},
                }}
                indeterminate={includeInderterminate && value === null}
                className="swiper-no-swiping"
                onChange={(e) => {
                  switch (value) {
                    case true:
                      onChange(includeInderterminate ? null : false);
                      break;
                    case false:
                      onChange(true);
                      break;
                    case null:
                      onChange(false);
                      break;
                  }
                  if (onChangeCallback) onChangeCallback(e);
                  // onChange(e);
                }}
                // error={!!get(errors, name)}
                // helperText={
                //   get(errors, name) ? get(errors, name).message : '' || (warning && warning(value))
                // }
              />
            );
          }}
        />
      }
    />
  );
};

export default FormCheckbox;
