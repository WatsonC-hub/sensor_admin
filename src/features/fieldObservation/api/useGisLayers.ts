import {queryOptions, useQuery} from '@tanstack/react-query';
import axios from 'axios';

import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

/**
 * Explorer's GIS layer catalog (GC2 layers in schema `explorer` tagged `gis`).
 * Read through Explorer, proxied under /explorer, so Field owns no layer setup of its own.
 */
export type GisLayer = {
  /** "schema.table"; also the WMS layer name. */
  id: string;
  title: string;
  group: string | null;
  geometry_type: string | null;
  has_labels: boolean;
  maxscale: number | null;
};

export const EXPLORER_BASE = '/explorer';

/** WMS endpoint for a layer, through Explorer's GC2 proxy. */
export const gisLayerWmsUrl = (layerId: string) => {
  const [schema] = layerId.split('.');
  return `${EXPLORER_BASE}/gc2/wms/watsonc/${schema}`;
};

export const gisLayersQueryOptions = queryOptions({
  queryKey: queryKeys.explorerGisLayers(),
  queryFn: async () => {
    const {data} = await axios.get<GisLayer[]>(`${EXPLORER_BASE}/api/gis-layers/gis`, {
      timeout: 15_000,
    });
    return data;
  },
  // The catalog rarely changes; keep it for offline use.
  staleTime: 1000 * 60 * 60,
  gcTime: 1000 * 60 * 60 * 24 * 7,
});

export const useGisLayers = () => useQuery(gisLayersQueryOptions);
