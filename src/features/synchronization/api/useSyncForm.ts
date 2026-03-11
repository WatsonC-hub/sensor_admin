import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z} from 'zod';
import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';

const syncSchema = z.object({
  dmp: z.union([
    z.object({
      owner_cvr: z.number({
        required_error: 'Data ejer skal vælges',
        message: 'Data ejer skal vælges',
      }),
      owner_name: z.union([z.string(), z.literal('')]),
    }),
    z.literal(false),
    z.literal(null),
  ]),
  jupiter: z
    .boolean({required_error: 'Vælg venligst om der skal synkroniseres til Jupiter'})
    .nullable(),
});

export type SyncFormSchema = z.infer<typeof syncSchema>;

type SyncContext = {
  tstype_id?: number;
  loctype_id?: number;
  ts_id?: number;
};

type SyncFormProps<T extends FieldValues> = {
  defaultValues?: DefaultValues<T>;
  values?: T;
  context: SyncContext;
};

const useSyncForm = <T extends FieldValues>({defaultValues, values, context}: SyncFormProps<T>) => {
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

  let conditionalSchema = z.object({});
  if (!canSyncJupiter) {
    conditionalSchema = syncSchema.extend({
      ...syncSchema.shape,
      jupiter: syncSchema.shape.jupiter.optional(),
    });
  }

  if (!isDmpAllowed) {
    conditionalSchema = conditionalSchema.extend({
      ...syncSchema.shape,
      dmp: syncSchema.shape.dmp.optional(),
    });
  }

  const owners: Array<{cvr: string; name: string}> = result.data;

  const syncFormMethods = useForm<T>({
    resolver: zodResolver(conditionalSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values: values,
  });

  return {syncFormMethods, isDmpAllowed, canSyncJupiter, owners};
};

export default useSyncForm;
