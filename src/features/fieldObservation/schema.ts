import {z} from 'zod';

const optionalText = z.string().transform((value) => value.trim() || null);

export const observationFormSchema = z.object({
  type_id: z.number({error: 'Vælg en type'}),
  // '' is "Intet projekt"
  project_no: z.string().transform((value) => value || null),
  note: optionalText,
  internal_note: optionalText,
});

export type ObservationFormInput = z.input<typeof observationFormSchema>;
export type ObservationFormOutput = z.output<typeof observationFormSchema>;
