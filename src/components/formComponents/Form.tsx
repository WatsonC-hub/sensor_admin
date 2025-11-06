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
  const Form = (props: React.ComponentProps<typeof TypedForm<T>>) => <TypedForm<T> {...props} />;

  const FormInputComponent = (props: React.ComponentProps<typeof FormInputWrapper<T>>) => (
    <FormInputWrapper<T> {...props} />
  );
  FormInputComponent.displayName = 'TypedForm.Input';

  const CheckboxComponent = (props: React.ComponentProps<typeof FormCheckbox<T>>) => (
    <FormCheckbox<T> {...props} />
  );
  CheckboxComponent.displayName = 'TypedForm.Checkbox';

  const RadioComponent = (props: React.ComponentProps<typeof FormRadio<T>>) => (
    <FormRadio<T> {...props} />
  );
  RadioComponent.displayName = 'TypedForm.Radio';

  const DateTimeComponent = (props: React.ComponentProps<typeof FormDateTimeWrapper<T>>) => (
    <FormDateTimeWrapper<T> {...props} />
  );
  DateTimeComponent.displayName = 'TypedForm.DateTime';

  const AutocompleteComponent = <K extends object, M extends boolean = false>(
    props: React.ComponentProps<typeof FormAutocomplete<T, K, M>>
  ) => <FormAutocomplete<T, K, M> {...props} />;
  AutocompleteComponent.displayName = 'TypedForm.Autocomplete';

  // Form.Submit = (props: React.ComponentProps<typeof Submit<T>>) => <Submit<T> {...props} />;
  const SubmitComponent = (props: React.ComponentProps<typeof Submit<T>>) => (
    <Submit<T> {...props} />
  );
  SubmitComponent.displayName = 'TypedForm.Submit';

  const CancelComponent = (props: React.ComponentProps<typeof Cancel>) => <Cancel {...props} />;
  CancelComponent.displayName = 'TypedForm.Cancel';

  Form.Input = FormInputComponent;
  Form.Checkbox = CheckboxComponent;
  Form.Radio = RadioComponent;
  Form.DateTime = DateTimeComponent;
  Form.Autocomplete = AutocompleteComponent;
  Form.Submit = SubmitComponent;
  Form.Cancel = CancelComponent;

  return Form;
}
