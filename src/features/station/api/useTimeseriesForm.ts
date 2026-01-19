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
  formProps,
  mode,
}: useTimeseriesFormProps<T>) => {
  const loctype_id = formProps.context?.loctype_id;
  if (mode === undefined) {
    throw new Error('mode is required');
  }

  const [schema, form] = getSchemaAndForm(loctype_id, mode);

  const arraySchema = z.object({
    timeseries: z.array(schema.optional()).superRefine((value, ctx) => {
      const seen = new Map<string, number>();
      value.forEach((ts, index) => {
        if (ts && 'tstype_id' in ts === true && 'intakeno' in ts === true) {
          if (!ts.tstype_id || !ts.intakeno) return;

          const key = `${ts.intakeno ?? 0}-${ts.tstype_id}`;
          const message =
            'Tidsserietype og indtag kombinationen skal være unik i listen af tidsserier';
          if (seen.has(key)) {
            const firstIndex = seen.get(key)!;

            ctx.addIssue({
              path: [index, 'tstype_id'],
              message: message,
              code: z.ZodIssueCode.custom,
            });

            ctx.addIssue({
              path: [firstIndex, 'tstype_id'],
              message: message,
              code: z.ZodIssueCode.custom,
            });
          } else {
            seen.set(key, index);
          }
        }
      });
    }),
  });

  const formMethods = useForm<T, {loctype_id: number | undefined}>({
    resolver: zodResolver(mode === 'Add' ? arraySchema : schema),
    ...formProps,
    mode: 'onTouched',
  });

  return [formMethods, form] as const;
};

export default useTimeseriesForm;
