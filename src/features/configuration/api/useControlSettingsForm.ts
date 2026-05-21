import {zodResolver} from '@hookform/resolvers/zod';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z} from 'zod';

const controlSettingsSchema = z.object({
  controls_per_year: z.number({
    message: 'Antal kontroller er påkrævet',
  }),
  lead_time: z.number().nullish(),
  dummy: z.number().nullish().optional(),
  selectValue: z.literal(1).or(z.literal(2)).default(1),
  from_unit: z.boolean().optional(),
});

export type ControlSettingsFormValues = z.infer<typeof controlSettingsSchema>;

type ControlSettingsProps<T extends FieldValues> = {
  defaultValues: DefaultValues<T> | undefined;
  values?: T;
};

const useControlSettingsForm = <T extends FieldValues, S extends FieldValues = T>({
  defaultValues,
  values,
}: ControlSettingsProps<T>) => {
  const controlSettingsFormMethods = useForm<T, unknown, S>({
    resolver: zodResolver(controlSettingsSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values,
  });

  return controlSettingsFormMethods;
};

export default useControlSettingsForm;
