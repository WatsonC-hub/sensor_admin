import {
  BaseLocation,
  baseLocationSchema,
  boreholeAddLocationSchema,
  boreholeEditLocationSchema,
  defaultAddLocationSchema,
  defaultEditLocationSchema,
} from '../schema';
import {DefaultValues, FieldValues, Path, useForm} from 'react-hook-form';
import {z, ZodObject} from 'zod';
import React from 'react';
import DefaultLocationForm from '../components/stamdata/stamdataComponents/DefaultLocationForm';
import BoreholeLocationForm from '../components/stamdata/stamdataComponents/BoreholeLocationForm';
import BaseLocationForm from '../components/stamdata/stamdataComponents/BaseLocationForm';
import BoreholeLocationEditForm from '../components/stamdata/stamdataComponents/BoreholeLocationEditForm';
import DefaultLocationEditForm from '../components/stamdata/stamdataComponents/DefaultLocationEditForm';
import {useUser} from '~/features/auth/useUser';
import {User} from '@sentry/react';
import {zodResolver} from '@hookform/resolvers/zod';

type useLocationFormProps<T> =
  | {
      mode: 'Add';
      defaultValues?: DefaultValues<T>;
      initialLocTypeId?: number;
      context: {loc_id: number};
    }
  | {
      mode: 'Edit';
      defaultValues?: DefaultValues<T>;
      initialLocTypeId?: number;
      context: {loc_id: number};
    };

const getSchemaAndForm = <T extends FieldValues>(
  loctype_id: number,
  mode: 'Add' | 'Edit',
  user: User
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

  if (user?.superUser === false && mode === 'Add') {
    selectedSchema = selectedSchema.extend({
      initial_project_no: z.string().optional(),
    });
  }

  return [selectedSchema as ZodObject<T>, selectedForm] as const;
};

const useLocationForm = <T extends BaseLocation>({
  defaultValues,
  mode,
  context,
  initialLocTypeId = -1,
}: useLocationFormProps<T>) => {
  const user = useUser();
  const [loctype_id, setLoctypeId] = React.useState<number>(initialLocTypeId);

  const [schema, form] = getSchemaAndForm<T>(loctype_id, mode, user);

  const {data, success} = schema.safeParse({
    ...defaultValues,
  });
  const defaultValuesData = data as unknown as DefaultValues<T>;

  const formMethods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: success ? defaultValuesData : defaultValues,
    mode: 'onTouched',
    context: context,
  });

  const {watch} = formMethods;

  const loctype_id_watch = watch('loctype_id' as Path<T>) as number;

  React.useEffect(() => {
    setLoctypeId(loctype_id_watch);
  }, [loctype_id_watch]);

  return [formMethods, form] as const;
};

export default useLocationForm;
