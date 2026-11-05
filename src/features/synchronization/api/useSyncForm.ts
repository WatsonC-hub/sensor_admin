import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import {useDMPAllowedList} from '~/features/station/api/useDmpAllowedMapList';

import type {DefaultValues} from 'react-hook-form';

const syncSchema = z.object({
  dmp: z
    .union([
      z.object({
        owner_cvr: z.number({
          message: 'Data ejer skal vælges',
        }),
        owner_name: z.union([z.string(), z.literal('')]),
      }),
      z.literal(false),
      z.literal(null),
    ])
    .optional(),
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

export type Owner = {
  cvr: number;
  name: string;
  label: string;
};

type MetadataOwner = {cvr?: string; name?: string};

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
          const metadata: {stationOwners?: MetadataOwner[]; dataResponsibles?: MetadataOwner[]} =
            await res.json();
          // The same CVR can appear in both lists, sometimes with the CVR as its name.
          const byCvr = new Map<string, string>();
          for (const {cvr, name} of [
            ...(metadata.stationOwners ?? []),
            ...(metadata.dataResponsibles ?? []),
          ]) {
            const key = cvr?.trim();
            if (!key) continue;
            const trimmedName = name?.trim();
            const existing = byCvr.get(key);
            if (!existing || (existing === key && trimmedName)) {
              byCvr.set(key, trimmedName || key);
            }
          }
          return Array.from(byCvr, ([cvr, name]): Owner => ({
            cvr: parseInt(cvr),
            name,
            label: name === cvr ? cvr : `${name} (${cvr})`,
          })).sort((a, b) => a.name.localeCompare(b.name, 'da'));
        }
      );
      return data;
    },
    enabled: isDmpAllowed,
  });

  const conditionalSchema = syncSchema.superRefine((data, ctx) => {
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

  const owners: Array<Owner> | undefined = result.data;
  type conditionalOutputType = z.output<typeof conditionalSchema>;
  const syncFormMethods = useForm<SyncFormSchema, unknown, conditionalOutputType>({
    resolver: zodResolver(conditionalSchema),
    defaultValues: defaultValues,
    mode: 'onTouched',
    values: values,
  });

  return {syncFormMethods, isDmpAllowed, canSyncJupiter, owners, isOwnersLoading: result.isLoading};
};

export default useSyncForm;
