import {
  baseTimeseriesSchema,
  boreholeAddTimeseriesSchema,
  boreholeEditTimeseriesSchema,
  defaultAddTimeseriesSchema,
  defaultEditTimeseriesSchema,
} from '../schema';
import {zodResolver} from '@hookform/resolvers/zod';
import {FieldValues, useForm, UseFormProps} from 'react-hook-form';
import DefaultTimeseriesForm from '../components/stamdata/stamdataComponents/DefaultTimeseriesForm';
import BoreholeTimeseriesForm from '../components/stamdata/stamdataComponents/BoreholeTimeseriesForm';
import DefaultTimeseriesEditForm from '../components/stamdata/stamdataComponents/DefaultTimeseriesEditForm';
import BoreholeTimeseriesEditForm from '../components/stamdata/stamdataComponents/BoreholeTimeseriesEditForm';
import {z} from 'zod';

type useTimeseriesFormProps<T extends FieldValues> = {
  formProps: UseFormProps<T, {loctype_id: number | undefined; loc_id?: number | undefined}>;
  mode: 'Add' | 'Edit';
};

const getSchemaAndForm = (
  loctype_id: number | undefined,
  mode: 'Add' | 'Edit',
  loc_id?: number | undefined
) => {
  let selectedSchema = baseTimeseriesSchema;
  let selectedForm = DefaultTimeseriesForm;

  switch (true) {
    case loctype_id === 9 && mode === 'Add':
      selectedSchema = boreholeAddTimeseriesSchema;
      selectedForm = BoreholeTimeseriesForm;
      break;
    case loctype_id === 9 && mode === 'Edit':
      selectedSchema = boreholeEditTimeseriesSchema;
      selectedForm = BoreholeTimeseriesEditForm;
      break;
    case mode === 'Add':
      selectedSchema = defaultAddTimeseriesSchema;
      selectedForm = DefaultTimeseriesForm;
      break;
    case mode === 'Edit':
      selectedSchema = defaultEditTimeseriesSchema;
      selectedForm = DefaultTimeseriesEditForm;
      break;
  }

  if (loc_id === undefined) {
    selectedSchema = selectedSchema.extend({
      tstype_id: z.number().optional(),
    });
  }

  return [selectedSchema, selectedForm] as const;
};

const useTimeseriesForm = <T extends Record<string, any>>({
  formProps,
  mode,
}: useTimeseriesFormProps<T>) => {
  const loctype_id = formProps.context?.loctype_id;
  const loc_id = formProps.context?.loc_id;
  if (mode === undefined) {
    throw new Error('mode is required');
  }

  const [schema, form] = getSchemaAndForm(loctype_id, mode, loc_id);

  const formMethods = useForm<T, {loctype_id: number | undefined}>({
    resolver: zodResolver(schema),
    ...formProps,
    mode: 'onTouched',
  });

  return [formMethods, form] as const;
};

export default useTimeseriesForm;
