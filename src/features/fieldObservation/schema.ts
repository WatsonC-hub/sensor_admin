import {z} from 'zod';

const optionalText = z.string().transform((value) => value.trim() || null);

export const observationFormSchema = z.object({
  type_id: z.number({error: 'Vælg en type'}),
  // '' is "Intet projekt"
  project_no: z.string().transform((value) => value || null),
  note: optionalText,
  internal_note: optionalText,
  // Validated per type by propertiesSchema (typeFields.ts), added in the dialog.
  properties: z.record(z.string(), z.unknown()),
});

export type ObservationFormInput = z.input<typeof observationFormSchema>;
export type ObservationFormOutput = z.output<typeof observationFormSchema>;
