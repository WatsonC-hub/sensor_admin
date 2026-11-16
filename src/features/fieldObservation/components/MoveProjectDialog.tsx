import CloseIcon from '@mui/icons-material/Close';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';

import type {Project} from '~/features/fieldObservation/types';

type Props = {
  /** The feltobservation's projekt now (left out of the list). */
  currentProjectNo: string | null;
  /** The projekter the user can edit. */
  projects: Project[];
  onMove: (projectNo: string) => void;
  onClose: () => void;
};

const projectLabel = (project: Project) =>
  project.project_title ? `${project.project_no} – ${project.project_title}` : project.project_no;

/** Flyt til andet projekt: a rare action, so it lives behind the Flyt menu in Rediger. */
const MoveProjectDialog = ({currentProjectNo, projects, onMove, onClose}: Props) => {
  const [chosen, setChosen] = useState<Project | null>(null);
  const options = projects.filter((project) => project.project_no !== currentProjectNo);

  return (
    <Dialog open fullWidth maxWidth="xs" onClose={onClose}>
      <DialogTitle>Flyt til andet projekt</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{mb: 2, color: 'text.secondary'}}>
          Nu: {currentProjectNo ?? 'Intet projekt'}. Kun projekter, du kan redigere i, kan vælges.
        </Typography>
        <Autocomplete
          autoFocus
          options={options}
          value={chosen}
          onChange={(_event, value) => setChosen(value)}
          getOptionLabel={projectLabel}
          isOptionEqualToValue={(option, value) => option.project_no === value.project_no}
          renderInput={(params) => <TextField {...params} size="small" label="Projekt" />}
          noOptionsText="Ingen projekter"
        />
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" startIcon={<CloseIcon />} onClick={onClose}>
          Annuller
        </Button>
        <Button
          bttype="primary"
          startIcon={<DriveFileMoveIcon />}
          disabled={!chosen}
          onClick={() => chosen && onMove(chosen.project_no)}
        >
          Flyt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveProjectDialog;
