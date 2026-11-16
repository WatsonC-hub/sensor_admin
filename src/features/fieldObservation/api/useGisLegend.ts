import {queryOptions, useQuery} from '@tanstack/react-query';
import axios from 'axios';

import {EXPLORER_BASE, gisLayerWmsUrl} from '~/features/fieldObservation/api/useGisLayers';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

/** One row of a GIS layer's legend: its label and its symbol as a `data:` image. */
export type GisLegendRow = {name: string; swatch: string | undefined};

/**
 * GC2's legend HTML (a table, one row per class) as rows, as Explorer reads it
 * (calypso-explorer client/src/components/gis/legend/gc2Legend.ts). Only text and
 * `data:image/` sources are taken and nothing is put into the DOM, so no sanitizing is needed.
 */
const parseGc2Legend = (html: string | undefined): GisLegendRow[] => {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('tr')]
    .map((row) => {
      const src = row.querySelector('img')?.getAttribute('src')?.trim() ?? '';
      const name =
        (row.querySelector('.legend-text') ?? row.lastElementChild)?.textContent?.trim() ?? '';
      return {name, swatch: src.startsWith('data:image/') ? src : undefined};
    })
    .filter((row) => row.name || row.swatch);
};

/** A GIS layer's legend, through Explorer's GC2 proxy. */
export const gisLegendQueryOptions = (layerId: string) =>
  queryOptions({
    queryKey: queryKeys.explorerGisLegend(layerId),
    queryFn: async () => {
      const {data} = await axios.get<{html: string}>(
        `${EXPLORER_BASE}/gc2/api/v1/legend/html/watsonc`,
        {params: {l: layerId}, timeout: 15_000}
      );
      return parseGc2Legend(data.html);
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

export const useGisLegend = (layerId: string) => useQuery(gisLegendQueryOptions(layerId));

/** GC2's whole-legend image, for layers whose HTML legend has no rows (e.g. rasters). */
export const gisLegendGraphicUrl = (layerId: string) =>
  `${gisLayerWmsUrl(layerId)}?service=WMS&version=1.3.0&request=GetLegendGraphic` +
  `&layer=${encodeURIComponent(layerId)}&format=image/png&SLD_VERSION=1.1.0`;
