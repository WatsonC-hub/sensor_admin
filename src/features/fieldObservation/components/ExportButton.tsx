import DownloadIcon from '@mui/icons-material/Download';
import {CircularProgress, IconButton, Tooltip} from '@mui/material';
import React from 'react';
import {toast} from 'react-toastify';

import {useExportGeoPackage} from '~/features/fieldObservation/api/useExportGeoPackage';

import type {LocalObservation} from '~/features/fieldObservation/types';

type Props = {
  projectNo: string | null;
  /** The chosen projekt's feltobservationer on the device. */
  observations: LocalObservation[];
  disabled?: boolean;
};

/**
 * Hent som GeoPackage: the chosen projekt's feltobservationer as a file for QGIS. The file is
 * built from the server's data, so what is not overført yet is not in it.
 */
const ExportButton = ({projectNo, observations, disabled}: Props) => {
  const exportGeoPackage = useExportGeoPackage();

  const download = () => {
    if (projectNo === null) return;
    const notSent = observations.filter((observation) => observation.dirty !== 0).length;
    exportGeoPackage.mutate(projectNo, {
      onSuccess: () => {
        if (notSent > 0) {
          toast.warning(
            notSent === 1
              ? '1 feltobservation er ikke overført og er ikke med i filen.'
              : `${notSent} feltobservationer er ikke overført og er ikke med i filen.`
          );
        }
      },
    });
  };

  const title =
    projectNo === null ? 'Vælg et projekt for at hente det som GeoPackage' : 'Hent som GeoPackage';

  return (
    <Tooltip title={title}>
      {/* The span lets the tooltip show while the button is disabled. */}
      <span>
        <IconButton
          color="inherit"
          aria-label="Hent som GeoPackage"
          disabled={disabled || projectNo === null || exportGeoPackage.isPending}
          onClick={download}
        >
          {exportGeoPackage.isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <DownloadIcon />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ExportButton;
