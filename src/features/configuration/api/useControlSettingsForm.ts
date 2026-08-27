import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import type {DefaultValues} from 'react-hook-form';

const controlSettingsSchema = z.object({
  controls_per_year: z
    .number({
      message: 'Antal kontroller er påkrævet',
    })
    .nullable(),
  lead_time: z.number().nullish(),
  dummy: z.number().nullish().optional(),
  selectValue: z.literal(1).or(z.literal(2)).default(1),
  from_unit: z.boolean().optional(),
});

export type ControlSettingsFormValues = z.infer<typeof controlSettingsSchema>;
export type ControlSettingsOutput = z.output<typeof controlSettingsSchema>;
export type ControlSettingsInput = z.input<typeof controlSettingsSchema>;

type ControlSettingsProps = {
  defaultValues: DefaultValues<ControlSettingsInput> | undefined;
  values?: ControlSettingsInput;
};

const useControlSettingsForm = ({defaultValues, values}: ControlSettingsProps) => {
  const controlSettingsFormMethods = useForm<ControlSettingsInput, unknown, ControlSettingsOutput>({
    resolver: zodResolver(controlSettingsSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values,
  });

  return controlSettingsFormMethods;
};

export default useControlSettingsForm;
