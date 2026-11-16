import {useMutation} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

import type {ImportParseResponse} from '~/features/fieldObservation/types';

const PARSE_TIMEOUT_MS = 120_000;

/** Upload a GIS file and get its features back in EPSG:4326. The server stores nothing. */
export const parseImportFile = async (file: File, layer: string | null) => {
  const body = new FormData();
  body.append('file', file);
  if (layer) body.append('layer', layer);
  const {data} = await apiClient.post<ImportParseResponse>(
    '/field_observation/import/parse',
    body,
    {timeout: PARSE_TIMEOUT_MS}
  );
  return data;
};

export const useParseImport = () =>
  useMutation({
    mutationFn: ({file, layer}: {file: File; layer: string | null}) => parseImportFile(file, layer),
    // Parsing changes nothing on the server, so no queries need invalidating.
    meta: {optOutGeneralInvalidations: true},
  });
