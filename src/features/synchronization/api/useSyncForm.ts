import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';

import type {DefaultValues} from 'react-hook-form';

const syncSchema = z.object({
  dmp: z.union([
    z.object({
      owner_cvr: z.number({
        message: 'Data ejer skal vælges',
      }),
      owner_name: z.union([z.string(), z.literal('')]),
    }),
    z.literal(false),
    z.literal(null),
  ]),
  jupiter: z.boolean({message: 'Vælg venligst om der skal synkroniseres til Jupiter'}).nullish(),
});

export type SyncFormSchema = z.input<typeof syncSchema>;
export type SyncFormSchemaOutput = z.output<typeof syncSchema>;

type SyncContext = {
  tstype_id?: number;
  loctype_id?: number;
  ts_id?: number;
};

type SyncFormProps = {
  defaultValues?: DefaultValues<SyncFormSchema>;
  values?: SyncFormSchema;
  context: SyncContext;
};

const useSyncForm = ({defaultValues, values, context}: SyncFormProps) => {
  const isJupiterType = [1, 11, 12, 16].includes(context?.tstype_id || 0);
  const isBorehole = context?.loctype_id === 9;

  const {data} = useDMPAllowedList();

  const isDmpAllowed = data?.some((combination) => {
    return (
      combination.loctype_id === context?.loctype_id && combination.tstype_id === context?.tstype_id
    );
  });
  const canSyncJupiter = isBorehole && isJupiterType;

  const result = useQuery({
    queryKey: ['owners'],
    queryFn: async () => {
      const data = await fetch(`https://kemidata.miljoeportal.dk/api/metadata?language=da`).then(
        async (res) => {
          const metadata = await res.json();
          return metadata.stationOwners;
        }
      );
      return data;
    },
    enabled: isDmpAllowed,
  });

  const conditionalSchema = syncSchema.superRefine((data, ctx) => {
    if (canSyncJupiter && (data.jupiter === undefined || data.jupiter === null)) {
      ctx.addIssue({
        code: 'custom',
        path: ['jupiter'],
        message: 'Vælg venligst om der skal synkroniseres til Jupiter',
      });
    }

    if (
      isDmpAllowed &&
      data.dmp !== undefined &&
      data.dmp !== null &&
      data.dmp !== false &&
      data.dmp.owner_cvr === undefined
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dmp'],
        message: 'Data ejer skal vælges',
      });
    }
  });
  // if (!canSyncJupiter) {
  //   conditionalSchema = syncSchema.extend({
  //     ...syncSchema.shape,
  //     jupiter: syncSchema.shape.jupiter.optional(),
  //   });
  // }

  // if (!isDmpAllowed) {
  //   conditionalSchema = conditionalSchema.extend({
  //     ...syncSchema.shape,
  //     dmp: syncSchema.shape.dmp.optional(),
  //   });
  // }

  const owners: Array<{cvr: string; name: string}> = result.data;

  // type conditionalType = z.infer<typeof conditionalSchema>;
  type conditionalOutputType = z.output<typeof conditionalSchema>;

  const syncFormMethods = useForm<SyncFormSchema, unknown, conditionalOutputType>({
    resolver: zodResolver(conditionalSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values: values,
  });

  return {syncFormMethods, isDmpAllowed, canSyncJupiter, owners};
};

export default useSyncForm;
