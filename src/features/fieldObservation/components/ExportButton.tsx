import DownloadIcon from '@mui/icons-material/Download';
import {IconButton, Tooltip} from '@mui/material';
import React, {useState} from 'react';

import ExportDialog from '~/features/fieldObservation/components/ExportDialog';

import type {
  LocalObservation,
  ObservationType,
  ProjectLayer,
} from '~/features/fieldObservation/types';

type Props = {
  projectNo: string | null;
  /** The chosen projekt's feltobservationer on the device. */
  observations: LocalObservation[];
  types: ObservationType[];
  /** The chosen projekt's projektlag. */
  projectLayers: ProjectLayer[];
  disabled?: boolean;
};

/**
 * Hent som GeoPackage: opens the dialog that chooses what goes in a file for QGIS, built from
 * the server's data for the chosen projekt.
 */
const ExportButton = ({projectNo, observations, types, projectLayers, disabled}: Props) => {
  const [open, setOpen] = useState(false);
  const title =
    projectNo === null ? 'Vælg et projekt for at hente det som GeoPackage' : 'Hent som GeoPackage';

  return (
    <>
      <Tooltip title={title}>
        {/* The span lets the tooltip show while the button is disabled. */}
        <span>
          <IconButton
            color="inherit"
            aria-label="Hent som GeoPackage"
            disabled={disabled || projectNo === null}
            onClick={() => setOpen(true)}
          >
            <DownloadIcon />
          </IconButton>
        </span>
      </Tooltip>
      {open && projectNo !== null && (
        <ExportDialog
          projectNo={projectNo}
          observations={observations}
          types={types}
          projectLayers={projectLayers}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default ExportButton;
