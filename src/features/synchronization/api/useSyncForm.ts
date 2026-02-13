import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {DefaultValues, FieldValues, useForm} from 'react-hook-form';
import {z} from 'zod';
import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';

const syncSchema = z.object({
  owner_cvr: z.number().optional(),
  owner_name: z.union([z.string(), z.literal('')]).optional(),
  jupiter: z.boolean().optional(),
});

export type SyncFormValues = z.infer<typeof syncSchema>;

type SyncContext = {
  tstype_id?: number;
  loctype_id?: number;
  ts_id?: number;
};

type SyncFormProps<T extends FieldValues> = {
  defaultValues?: DefaultValues<T>;
  values?: SyncFormValues;
  context: SyncContext;
  schema?: z.ZodType<T>;
};

const useSyncForm = <T extends FieldValues>({
  defaultValues,
  values,
  context,
  schema,
}: SyncFormProps<T>) => {
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

  const owners: Array<{cvr: string; name: string}> = result.data;
  const owner = owners?.find((owner) => owner.cvr === values?.owner_cvr?.toString());

  let refined = schema;
  if (isDmpAllowed) {
    refined = schema?.refine(
      (data) => {
        return data.owner_cvr !== undefined && data.owner_cvr !== null;
      },
      {
        path: ['owner_cvr'],
        message: 'Data ejer skal være udfyldt',
      }
    );
  }

  const syncFormMethods = useForm<T>({
    resolver: zodResolver(refined ? refined : syncSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values: {
      ...values,
      owner_name: owner?.name,
      owner_cvr: values?.owner_cvr ? Number(values.owner_cvr) : undefined,
    } as unknown as T,
  });

  return {syncFormMethods, isDmpAllowed, canSyncJupiter, owners};
};

export default useSyncForm;
