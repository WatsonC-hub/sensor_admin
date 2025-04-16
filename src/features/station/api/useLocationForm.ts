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

const getSchemaAndForm = (
  loctype_id: number,
  mode: 'Add' | 'Edit',
  defaultValues?: DefaultValues<
    DefaultAddLocation | BoreholeAddLocation | DefaultEditLocation | BoreholeEditLocation
  >
) => {
  let selectedSchema: ZodType<Record<string, any>> = baseLocationSchema;
  let selectedForm = DefaultLocationForm;
  let values = undefined;

  switch (true) {
    case loctype_id === -1:
      selectedSchema = baseLocationSchema;
      selectedForm = BaseLocationForm;
      break;
    case loctype_id === 9 && mode === 'Add':
      selectedSchema = boreholeAddLocationSchema;
      selectedForm = BoreholeLocationForm;
      break;
    case loctype_id === 9 && mode === 'Edit': {
      selectedSchema = boreholeEditLocationSchema;

      const {data} = selectedSchema.safeParse({
        ...defaultValues,
      });
      values = data;
      selectedForm = BoreholeLocationEditForm;
      break;
    }
    case mode === 'Add':
      selectedSchema = defaultAddLocationSchema;
      selectedForm = DefaultLocationForm;
      break;
    case mode === 'Edit': {
      selectedSchema = defaultEditLocationSchema;

      const {data} = selectedSchema.safeParse({
        ...defaultValues,
      });
      values = data;
      selectedForm = DefaultLocationEditForm;
      break;
    }
  }

  return [selectedSchema, selectedForm, values] as const;
};

const useLocationForm = ({
  defaultValues,
  mode,
  context,
  initialLocTypeId = -1,
}: useLocationFormProps) => {
  const [loctype_id, setLoctypeId] = React.useState<number>(initialLocTypeId);

  const [schema, form, values] = getSchemaAndForm(loctype_id, mode);

  const formMethods = useForm<
    DefaultAddLocation | BoreholeAddLocation | DefaultEditLocation | BoreholeEditLocation
  >({
    resolver: zodResolver(schema),
    defaultValues: values ? values : defaultValues,
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
