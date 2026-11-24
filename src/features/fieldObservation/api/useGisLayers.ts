import {queryOptions, useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import type {VectorLayerStyle} from '~/features/fieldObservation/vectorStyle';

/**
 * Explorer's GIS layers (GC2 layers in schema `explorer` or `datagrundlag` tagged `gis`), listed by
 * our API from the same database. They are drawn as WMS through Explorer's GC2 proxy; the
 * `offline` ones can also be fetched as features for the projekt's area and kept on the device.
 */
export type GisLayer = {
  /** "schema.table"; also the WMS layer name. */
  id: string;
  title: string;
  group: string | null;
  geometry_type: string | null;
  /** Has features (not a raster or a cascaded WMS) and isn't tagged `no-wfs` in GC2. */
  offline: boolean;
  /** GC2's class styling as Leaflet styles; only for offline layers. */
  style: VectorLayerStyle | null;
};

export const EXPLORER_BASE = '/explorer';

/** WMS endpoint for a layer, through Explorer's GC2 proxy. */
export const gisLayerWmsUrl = (layerId: string) => {
  const [schema] = layerId.split('.');
  return `${EXPLORER_BASE}/gc2/wms/watsonc/${schema}`;
};

export const gisLayersQueryOptions = queryOptions({
  queryKey: queryKeys.fieldObservationGisLayers(),
  queryFn: async () => {
    const {data} = await apiClient.get<GisLayer[]>('/field_observation/gis-layers', {
      timeout: 15_000,
    });
    return data;
  },
  // The catalog rarely changes; keep it for offline use.
  staleTime: 1000 * 60 * 60,
  gcTime: 1000 * 60 * 60 * 24 * 7,
});

export const useGisLayers = () => useQuery(gisLayersQueryOptions);
