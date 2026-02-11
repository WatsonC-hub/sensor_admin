import {queryOptions, useQuery} from '@tanstack/react-query';
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

type CommandPaletteOptions = Omit<typeof getCMDOptions, 'queryKey' | 'queryFn'>;

const useCmdPalette = <T = Array<CommandPalette>>(options?: CommandPaletteOptions) => {
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
