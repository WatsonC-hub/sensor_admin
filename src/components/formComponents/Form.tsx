import React from 'react';
import {FieldValues} from 'react-hook-form';
import FormCheckbox from './FormCheckbox';
import FormInputWrapper from './FormInputWrapper';
import Submit from './Submit';
import TypedForm from './TypedForm';
import Cancel from './Cancel';
import FormAutocomplete from './FormAutocomplete';

export function createTypedForm<T extends FieldValues>() {
  const Form = (props: React.ComponentProps<typeof TypedForm<T>>) => TypedForm<T>(props);

  Form.Input = (props: React.ComponentProps<typeof FormInputWrapper<T>>) =>
    FormInputWrapper<T>(props);

  Form.Checkbox = (props: React.ComponentProps<typeof FormCheckbox<T>>) => FormCheckbox<T>(props);

  Form.Autocomplete = <K extends object>(
    props: React.ComponentProps<typeof FormAutocomplete<T, K>>
  ) => FormAutocomplete<T, K>(props);

  Form.Submit = (props: {submit: (values: T) => void}) => Submit<T>(props);
  Form.Cancel = Cancel;

  return Form;
}
