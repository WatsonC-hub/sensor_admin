import React from 'react';
import FormInput, {FormInputProps} from './FormInput';
import {FieldValues, FormProvider, Path, useFormContext, UseFormReturn} from 'react-hook-form';
import {GridBaseProps, Grid2} from '@mui/material';
import FormFieldset from './FormFieldset';
import Button from './Button';
import {Save} from '@mui/icons-material';
import FormDateTime, {FormDateTimeProps} from './FormDateTime';

export function createTypedForm<T extends FieldValues>() {
  const FormContext = React.createContext<{
    gridSizes?: GridBaseProps['size'];
  }>({
    gridSizes: {mobile: 12, laptop: 6},
  });

  type Props = {
    formMethods: UseFormReturn<T>;
    children: React.ReactNode;
    gridSizes?: GridBaseProps['size'];
    label: string;
  };

  const Form = ({formMethods, children, gridSizes = {mobile: 12, laptop: 6}, label}: Props) => {
    return (
      <FormContext.Provider value={{gridSizes}}>
        <FormProvider {...formMethods}>
          <FormFieldset label={label}>
            <Grid2 container spacing={2} sx={{marginTop: 2}}>
              {children}
            </Grid2>
          </FormFieldset>
        </FormProvider>
      </FormContext.Provider>
    );
  };

  type TextFieldProps = Omit<FormInputProps<T>, 'name'> & {
    name: Path<T>;
    gridSizes?: GridBaseProps['size'];
  };

  const FormInputWrapper = ({name, gridSizes, ...props}: TextFieldProps) => {
    const {gridSizes: contextGridSizes} = React.useContext(FormContext);
    return (
      <Grid2 size={gridSizes ?? contextGridSizes}>
        <FormInput<T> name={name} {...props} />
      </Grid2>
    );
  };

  type DateTimeProps = Omit<FormDateTimeProps<T>, 'name'> & {
    name: Path<T>;
    gridSizes?: GridBaseProps['size'];
  };

  const FormDateTimeWrapper = ({name, gridSizes, ...props}: DateTimeProps) => {
    const {gridSizes: contextGridSizes} = React.useContext(FormContext);
    return (
      <Grid2 size={gridSizes ?? contextGridSizes}>
        <FormDateTime<T> name={name} {...props} />
      </Grid2>
    );
  };

  const Submit = ({submit}: {submit: (values: T) => void}) => {
    const {
      handleSubmit,
      formState: {errors},
    } = useFormContext<T>();

    return (
      <Button
        bttype="primary"
        fullWidth={false}
        startIcon={<Save />}
        disabled={Object.keys(errors).length > 0}
        onClick={handleSubmit(submit, (errors) => console.log(errors))}
      >
        Gem
      </Button>
    );
  };

  const Cancel = ({cancel}: {cancel: () => void}) => {
    const {reset} = useFormContext();
    return (
      <Button
        bttype="tertiary"
        fullWidth={false}
        onClick={() => {
          reset();
          cancel();
        }}
      >
        Annuller
      </Button>
    );
  };

  Form.FormInput = FormInputWrapper;
  Form.FormDateTime = FormDateTimeWrapper;
  Form.Submit = Submit;
  Form.Cancel = Cancel;

  return Form;
}
