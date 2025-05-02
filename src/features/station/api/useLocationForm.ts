import {
  baseLocationSchema,
  BoreholeAddLocation,
  boreholeAddLocationSchema,
  BoreholeEditLocation,
  boreholeEditLocationSchema,
  DefaultAddLocation,
  defaultAddLocationSchema,
  DefaultEditLocation,
  defaultEditLocationSchema,
} from '../schema';
import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, useForm} from 'react-hook-form';
import {ZodType} from 'zod';
import React from 'react';
import DefaultLocationForm from '../components/stamdata/stamdataComponents/DefaultLocationForm';
import BoreholeLocationForm from '../components/stamdata/stamdataComponents/BoreholeLocationForm';
import BaseLocationForm from '../components/stamdata/stamdataComponents/BaseLocationForm';
import BoreholeLocationEditForm from '../components/stamdata/stamdataComponents/BoreholeLocationEditForm';
import DefaultLocationEditForm from '../components/stamdata/stamdataComponents/DefaultLocationEditForm';

type useLocationFormProps = {
  defaultValues?: DefaultValues<
    DefaultAddLocation | BoreholeAddLocation | DefaultEditLocation | BoreholeEditLocation
  >;
  mode: 'Add' | 'Edit';
  initialLocTypeId?: number;
  context: {loc_id: number};
};

const getSchemaAndForm = (loctype_id: number, mode: 'Add' | 'Edit') => {
  let selectedSchema: ZodType<Record<string, any>> = baseLocationSchema;
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

  return [selectedSchema, selectedForm] as const;
};

const useLocationForm = ({
  defaultValues,
  mode,
  context,
  initialLocTypeId = -1,
}: useLocationFormProps) => {
  const [loctype_id, setLoctypeId] = React.useState<number>(initialLocTypeId);

  const [schema, form] = getSchemaAndForm(loctype_id, mode);

  const {data: defaultValuesData, success} = schema.safeParse({
    ...defaultValues,
  });

  const formMethods = useForm<
    DefaultAddLocation | BoreholeAddLocation | DefaultEditLocation | BoreholeEditLocation
  >({
    resolver: zodResolver(schema),
    defaultValues: success ? defaultValuesData : defaultValues,
    mode: 'onTouched',
    context: context,
  });

  const {watch} = formMethods;

  const loctype_id_watch = watch('loctype_id');

  React.useEffect(() => {
    setLoctypeId(loctype_id_watch);
  }, [loctype_id_watch]);

  return [formMethods, form] as const;
};

export default useLocationForm;
