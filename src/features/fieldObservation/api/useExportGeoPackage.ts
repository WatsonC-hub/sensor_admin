import {useMutation} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

import type {ExportChoice} from '~/features/fieldObservation/state';

// Building the file reads the whole projekt; the server allows 60 s for the queries.
const EXPORT_TIMEOUT_MS = 120_000;

const fileName = (contentDisposition: string | undefined, projectNo: string) => {
  const match = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match ? decodeURIComponent(match[1]) : `feltobservationer_${projectNo}.gpkg`;
};

const saveFile = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Download a projekt's feltobservationer from the server as a GeoPackage for QGIS, with only
 * the chosen types and projektlag. The lists go as comma-separated text; empty means none.
 */
export const downloadGeoPackage = async (projectNo: string, choice: ExportChoice) => {
  const response = await apiClient.get<Blob>(
    `/field_observation/projects/${encodeURIComponent(projectNo)}/export.gpkg`,
    {
      params: {
        types: choice.types.join(','),
        project_layers: choice.projectLayers.join(','),
        images: choice.images,
      },
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT_MS,
    }
  );
  saveFile(response.data, fileName(response.headers['content-disposition'], projectNo));
};

export const useExportGeoPackage = () =>
  useMutation({
    mutationFn: ({projectNo, choice}: {projectNo: string; choice: ExportChoice}) =>
      downloadGeoPackage(projectNo, choice),
    // A download must not be queued for later like a registrering; offline it just fails.
    // Errors are shown by the global mutation handler in queryClient.ts.
    networkMode: 'always',
    // Reading only; nothing to invalidate.
    meta: {optOutGeneralInvalidations: true},
  });
