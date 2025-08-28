import {
  baseLocationSchema,
  boreholeAddLocationSchema,
  boreholeEditLocationSchema,
  defaultAddLocationSchema,
  defaultEditLocationSchema,
} from '../schema';
import {DefaultValues, FieldValues, Path, useForm, UseFormProps} from 'react-hook-form';
import {z, ZodObject} from 'zod';
import React from 'react';
import DefaultLocationForm from '../components/stamdata/stamdataComponents/DefaultLocationForm';
import BoreholeLocationForm from '../components/stamdata/stamdataComponents/BoreholeLocationForm';
import BaseLocationForm from '../components/stamdata/stamdataComponents/BaseLocationForm';
import BoreholeLocationEditForm from '../components/stamdata/stamdataComponents/BoreholeLocationEditForm';
import DefaultLocationEditForm from '../components/stamdata/stamdataComponents/DefaultLocationEditForm';
import {useUser} from '~/features/auth/useUser';
import {zodResolver} from '@hookform/resolvers/zod';

type useLocationFormProps<T extends FieldValues> = {
  formProps: UseFormProps<T, {loc_id: number | undefined}>;
  mode: 'Add' | 'Edit';
  initialLocTypeId?: number;
};

const getSchemaAndForm = <T extends FieldValues>(
  loctype_id: number,
  mode: 'Add' | 'Edit',
  superUser: boolean | undefined,
  loc_id: number | undefined
) => {
  let selectedSchema: ZodObject<Record<string, any>> = baseLocationSchema;
  let selectedForm = DefaultLocationForm;

  switch (true) {
    case loctype_id === -1:
      selectedSchema = baseLocationSchema;
      selectedForm = BaseLocationForm;
      break;
    case loctype_id === 9 && mode === 'Add':
      selectedSchema = boreholeAddLocationSchema;
      selectedForm = BoreholeLocationForm;
      break;
    case loctype_id === 9 && mode === 'Edit':
      selectedSchema = boreholeEditLocationSchema;
      selectedForm = BoreholeLocationEditForm;
      break;
    case mode === 'Add':
      selectedSchema = defaultAddLocationSchema;
      selectedForm = DefaultLocationForm;
      break;
    case mode === 'Edit':
      selectedSchema = defaultEditLocationSchema;
      selectedForm = DefaultLocationEditForm;
      break;
  }

  if (superUser === false || (mode === 'Add' && loc_id !== undefined)) {
    selectedSchema = selectedSchema.extend({
      initial_project_no: z.string().nullish(),
    });
  }

  return [selectedSchema as ZodObject<T>, selectedForm] as const;
};

const useLocationForm = <T extends Record<string, any>>({
  formProps,
  mode,
  initialLocTypeId = -1,
}: useLocationFormProps<T>) => {
  const user = useUser();
  const [loctype_id, setLoctypeId] = React.useState<number>(initialLocTypeId);

  const [schema, form] = getSchemaAndForm<T>(loctype_id, mode, user?.superUser, context.loc_id);

  const {data, success} = schema.safeParse({
    ...formProps.values,
  });
  const defaultValuesData = data as unknown as DefaultValues<T>;

  const formMethods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: success ? defaultValuesData : formProps.defaultValues,
    mode: 'onTouched',
    ...formProps,
  });

  const {watch} = formMethods;

  const loctype_id_watch = watch('loctype_id' as Path<T>) as number;

  React.useEffect(() => {
    setLoctypeId(loctype_id_watch);
  }, [loctype_id_watch]);

  return [formMethods, form, schema] as const;
};

export default useLocationForm;
