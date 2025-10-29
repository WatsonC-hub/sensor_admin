import {queryOptions, useQuery, UseQueryOptions} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

export type CommandPalette = {
  loc_id: number;
  loc_name: string;
  ts_id: number;
  ts_name: string;
  calypso_id: number | null;
  active: boolean;
};

const getCMDOptions = queryOptions<Array<CommandPalette>>({
  queryKey: queryKeys.cmdOptions(),
  queryFn: async () => {
    const {data} = await apiClient.get<Array<CommandPalette>>('/sensor_field/cmd_palette_options');
    return data;
  },
});

type CommandPaletteOptions<T> = Partial<
  Omit<UseQueryOptions<CommandPalette[], Error, T>, 'queryKey' | 'queryFn'>
>;

const useCmdPalette = <T extends Array<CommandPalette>>(options?: CommandPaletteOptions<T>) => {
  const get = useQuery({
    ...getCMDOptions,
    ...options,
    select: options?.select as (data: CommandPalette[]) => T,
  });

  return {
    get,
  };
};

export default useCmdPalette;
