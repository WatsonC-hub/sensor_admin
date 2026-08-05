import {
  baseTimeseriesSchema,
  boreholeAddTimeseriesSchema,
  boreholeEditTimeseriesSchema,
  defaultAddTimeseriesSchema,
  defaultEditTimeseriesSchema,
} from '../schema';
import {zodResolver} from '@hookform/resolvers/zod';
import type {FieldValues, DefaultValues} from 'react-hook-form';
import {useForm} from 'react-hook-form';
import DefaultTimeseriesForm from '../components/stamdata/stamdataComponents/DefaultTimeseriesForm';
import BoreholeTimeseriesForm from '../components/stamdata/stamdataComponents/BoreholeTimeseriesForm';
import DefaultTimeseriesEditForm from '../components/stamdata/stamdataComponents/DefaultTimeseriesEditForm';
import BoreholeTimeseriesEditForm from '../components/stamdata/stamdataComponents/BoreholeTimeseriesEditForm';
import type {ZodObject} from 'zod';

type useTimeseriesFormProps<T extends FieldValues> = {
  defaultValues?: DefaultValues<T>;
  mode: 'Add' | 'Edit';
  validate_mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  context?: {loctype_id: number | undefined; loc_id?: number | undefined};
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

  return [selectedSchema as ZodObject<any>, selectedForm] as const;
};

const useTimeseriesForm = ({
  defaultValues,
  mode,
  validate_mode = 'onTouched',
  context,
}: useTimeseriesFormProps<FieldValues>) => {
  const loctype_id = context?.loctype_id;
  if (mode === undefined) {
    throw new Error('mode is required');
  }

  const [schema, form] = getSchemaAndForm(loctype_id, mode);

  const formMethods = useForm({
    resolver: zodResolver(schema),
    mode: validate_mode,
    defaultValues,
  });

  return [formMethods, form] as const;
};

export default useTimeseriesForm;
