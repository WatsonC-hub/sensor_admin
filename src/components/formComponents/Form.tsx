import React, {JSX} from 'react';
import {FieldValues} from 'react-hook-form';
import FormCheckbox from './FormCheckbox';
import FormInputWrapper from './FormInputWrapper';
import Submit from './Submit';
import TypedForm from './TypedForm';
import Cancel from './Cancel';
import FormAutocomplete from './FormAutocomplete';
import FormRadio from './FormRadio';
import FormDateTimeWrapper from './FormDateTimeWrapper';

type TypedFormComponent<T extends FieldValues> = React.FC<
  React.ComponentProps<typeof TypedForm<T>>
> & {
  Input: React.FC<React.ComponentProps<typeof FormInputWrapper<T>>>;
  Checkbox: React.FC<React.ComponentProps<typeof FormCheckbox<T>>>;
  Radio: React.FC<React.ComponentProps<typeof FormRadio<T>>>;
  DateTime: React.FC<React.ComponentProps<typeof FormDateTimeWrapper<T>>>;
  Autocomplete: <K extends object, M extends boolean = false>(
    props: React.ComponentProps<typeof FormAutocomplete<T, K, M>>
  ) => JSX.Element;
  Submit: React.FC<React.ComponentProps<typeof Submit<T>>>;
  Cancel: React.FC<React.ComponentProps<typeof Cancel>>;
};

function wrap<TProps extends object>(
  Component: React.ComponentType<TProps>,
  displayName: string
): React.FC<TProps> {
  const Wrapped: React.FC<TProps> = (props) => <Component {...props} />;
  Wrapped.displayName = displayName;
  return Wrapped;
}

export function createTypedForm<T extends FieldValues = never>(): TypedFormComponent<T> {
  const Form = ((props) => <TypedForm<T> {...props} />) as TypedFormComponent<T>;

  Form.displayName = 'TypedForm';
  Form.Input = wrap(FormInputWrapper<T>, 'TypedForm.Input');
  Form.Checkbox = wrap(FormCheckbox<T>, 'TypedForm.Checkbox');
  Form.Radio = wrap(FormRadio<T>, 'TypedForm.Radio');
  Form.DateTime = wrap(FormDateTimeWrapper<T>, 'TypedForm.DateTime');
  Form.Submit = wrap(Submit<T>, 'TypedForm.Submit');
  Form.Cancel = wrap(Cancel, 'TypedForm.Cancel');

  const AutocompleteComponent = <K extends object, M extends boolean = false>(
    props: React.ComponentProps<typeof FormAutocomplete<T, K, M>>
  ) => <FormAutocomplete<T, K, M> {...props} />;
  AutocompleteComponent.displayName = 'TypedForm.Autocomplete';
  Form.Autocomplete = AutocompleteComponent;

  return Form;
}
