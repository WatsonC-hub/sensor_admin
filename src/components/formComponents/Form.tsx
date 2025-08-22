import React from 'react';
import {FieldValues} from 'react-hook-form';
import FormCheckbox from './FormCheckbox';
import FormInputWrapper from './FormInputWrapper';
import Submit from './Submit';
import TypedForm from './TypedForm';
import Cancel from './Cancel';
import FormAutocomplete from './FormAutocomplete';
import FormRadio from './FormRadio';
import FormDateTimeWrapper from './FormDateTimeWrapper';

export function createTypedForm<T extends FieldValues>() {
  const Form = (props: React.ComponentProps<typeof TypedForm<T>>) => TypedForm<T>(props);

  Form.Input = (props: React.ComponentProps<typeof FormInputWrapper<T>>) =>
    FormInputWrapper<T>(props);

  Form.Checkbox = (props: React.ComponentProps<typeof FormCheckbox<T>>) => FormCheckbox<T>(props);

  Form.Radio = (props: React.ComponentProps<typeof FormRadio<T>>) => FormRadio<T>(props);

  Form.DateTime = (props: React.ComponentProps<typeof FormDateTimeWrapper<T>>) =>
    FormDateTimeWrapper<T>(props);

  Form.Autocomplete = <K extends object, M extends boolean = false>(
    props: React.ComponentProps<typeof FormAutocomplete<T, K, M>>
  ) => FormAutocomplete<T, K, M>(props);

  Form.Submit = (props: {submit: (values: T) => void}) => Submit<T>(props);
  Form.Cancel = Cancel;

  return Form;
}
