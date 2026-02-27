import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {DefaultValues, useForm} from 'react-hook-form';
import {z} from 'zod';
import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';

const syncSchema = z.object({
  dmp: z
    .union([
      z.object({
        owner_cvr: z.number({
          required_error: 'Data ejer skal vælges',
          message: 'Data ejer skal vælges',
        }),
        owner_name: z.union([z.string(), z.literal('')]),
      }),
      z.literal(false),
    ])
    .nullish(),
  jupiter: z.boolean().nullish(),
});

export type SyncFormSchema = z.infer<typeof syncSchema>;

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

  const owners: Array<{cvr: string; name: string}> = result.data;

  const syncFormMethods = useForm<SyncFormSchema>({
    resolver: zodResolver(syncSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values: values,
  });

  return {syncFormMethods, isDmpAllowed, canSyncJupiter, owners};
};

export default useSyncForm;
