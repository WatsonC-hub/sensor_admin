import {
  baseTimeseriesSchema,
  boreholeAddTimeseriesSchema,
  boreholeEditTimeseriesSchema,
  defaultAddTimeseriesSchema,
  defaultEditTimeseriesSchema,
} from '../schema';
import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import DefaultTimeseriesForm from '../components/stamdata/stamdataComponents/DefaultTimeseriesForm';
import BoreholeTimeseriesForm from '../components/stamdata/stamdataComponents/BoreholeTimeseriesForm';
import DefaultTimeseriesEditForm from '../components/stamdata/stamdataComponents/DefaultTimeseriesEditForm';
import BoreholeTimeseriesEditForm from '../components/stamdata/stamdataComponents/BoreholeTimeseriesEditForm';

type useTimeseriesFormProps<T> = {
  defaultValues?: DefaultValues<T>;
  mode: 'Add' | 'Edit';
  context: {loctype_id: number | undefined};
};

const getSchemaAndForm = (loctype_id: number | undefined, mode: 'Add' | 'Edit') => {
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

  return [selectedSchema, selectedForm] as const;
};

const useTimeseriesForm = <T extends Record<string, any>>({
  defaultValues,
  context,
  mode,
}: useTimeseriesFormProps<T>) => {
  const loctype_id = context.loctype_id;

  if (mode === undefined) {
    throw new Error('mode is required');
  }

  const [schema, form] = getSchemaAndForm(loctype_id, mode);

  const formMethods = useForm<T, {loctype_id: number | undefined}>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    context: context,
  });

  return [formMethods, form] as const;
};

export default useTimeseriesForm;
