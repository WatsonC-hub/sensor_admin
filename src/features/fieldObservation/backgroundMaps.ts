import {queryOptions, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import L from 'leaflet';

import {createLuftfotoLayer, DATAFORSYNINGEN_TOKEN} from '~/features/fieldObservation/offlineTiles';
import {createDefaultLayer} from '~/features/map/mapConsts';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

/**
 * Background maps for /observation: the newest luftfoto (downloadable for offline use), Field's
 * own map, and Dataforsyningen's ortofoto with every year. Explorer's vector style map is left out.
 * Explorer has no endpoint for these yet, so the ortofoto setup is copied from
 * calypso-explorer client/src/hooks/useOrtoFoto.ts and components/mapExport/baseLayer.ts.
 */
export type BackgroundMapId = 'luftfoto' | 'field' | 'ortofoto';

export const BACKGROUND_MAPS: {id: BackgroundMapId; title: string}[] = [
  // The default: the newest ortofoto as tiles that can be downloaded for offline use.
  {id: 'luftfoto', title: 'Luftfoto (kan hentes offline)'},
  {id: 'field', title: 'Kort (Field)'},
  {id: 'ortofoto', title: 'Ortofoto, alle årgange (Dataforsyningen)'},
];

export const isBackgroundMapId = (id: unknown): id is BackgroundMapId =>
  BACKGROUND_MAPS.some((map) => map.id === id);

// Copied from Explorer, which uses the same public token in its client.
const ORTOFOTO_WMS_URL = 'https://api.dataforsyningen.dk/orto_foraar_DAF';
const ORTOFOTO_TOKEN = DATAFORSYNINGEN_TOKEN;

export const createBackgroundLayer = (id: BackgroundMapId, ortofotoYear: number | null) => {
  switch (id) {
    case 'luftfoto':
      return createLuftfotoLayer();
    case 'ortofoto':
      return L.tileLayer.wms(ORTOFOTO_WMS_URL, {
        // Until the year list has loaded, last year's photos are the safest guess:
        // the current year is usually published well into the year.
        layers: `geodanmark_${ortofotoYear ?? new Date().getFullYear() - 1}_12_5cm`,
        format: 'image/jpeg',
        version: '1.3.0',
        attribution: '&copy; SDFI / GeoDanmark',
        maxZoom: 22,
        // Extra options are sent as WMS parameters.
        token: ORTOFOTO_TOKEN,
      } as L.WMSOptions);
    default:
      return createDefaultLayer();
  }
};

/** The years the ortofoto WMS offers (layers named geodanmark_<year>_12_5cm), newest first. */
const ortofotoYearsQueryOptions = queryOptions({
  queryKey: queryKeys.ortofotoYears(),
  queryFn: async () => {
    const {data} = await axios.get<string>(ORTOFOTO_WMS_URL, {
      params: {service: 'WMS', request: 'GetCapabilities', token: ORTOFOTO_TOKEN},
      responseType: 'text',
      timeout: 20_000,
    });
    const xml = new DOMParser().parseFromString(data, 'text/xml');
    const years = Array.from(xml.querySelectorAll('Layer > Name'), (node) => node.textContent)
      .map((name) => /^geodanmark_(\d{4})_/.exec(name ?? '')?.[1])
      .filter((year): year is string => year !== undefined)
      .map(Number);
    return [...new Set(years)].sort((a, b) => b - a);
  },
  staleTime: 1000 * 60 * 60 * 24,
  gcTime: 1000 * 60 * 60 * 24 * 7,
});

export const useOrtofotoYears = (enabled: boolean) =>
  useQuery({...ortofotoYearsQueryOptions, enabled});
