import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  Alert,
  Badge,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Popover,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

import type {useOverfoersel} from '~/features/fieldObservation/overfoersel/useOverfoersel';

type Props = {
  overfoersel: ReturnType<typeof useOverfoersel>;
  notPersisted: boolean;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('da-DK', {hour: '2-digit', minute: '2-digit'});

/** An icon that shows the overførsel state at a glance and opens its settings. */
const OverfoerselMenu = ({overfoersel, notPersisted}: Props) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const {pending, rejected, running, paused, mode, lastError, lastSuccessAt, syncNow, setMode} =
    overfoersel;

  const problem = paused || lastError !== null || rejected > 0 || notPersisted;
  // Shown on Field's blue app bar, so normal states use the bar's text colour.
  const icon = running ? (
    <CircularProgress size={22} color="inherit" />
  ) : paused || lastError ? (
    <CloudOffIcon color="warning" />
  ) : pending > 0 ? (
    <CloudUploadIcon />
  ) : (
    <CloudDoneIcon />
  );

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Overførsel"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <Badge
          badgeContent={pending + rejected}
          color={problem ? 'warning' : 'secondary'}
          max={99}
          variant={pending + rejected === 0 && problem ? 'dot' : 'standard'}
          invisible={pending + rejected === 0 && !problem}
        >
          {icon}
        </Badge>
      </IconButton>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{paper: {sx: {p: 2, width: 300, maxWidth: 'calc(100vw - 32px)'}}}}
      >
        <Stack spacing={1.5}>
          <Typography variant="subtitle1">Overførsel</Typography>
          <Typography variant="body2">
            {pending === 0 ? 'Alt er overført' : `${pending} ikke overført`}
            {rejected > 0 && ` · ${rejected} afvist`}
          </Typography>
          {lastSuccessAt && (
            <Typography variant="caption" sx={{color: 'text.secondary'}}>
              Sidst overført kl. {formatTime(lastSuccessAt)}
            </Typography>
          )}
          {paused && (
            <Alert severity="warning">
              Dårlig forbindelse – automatisk overførsel er sat på pause. Dine data er gemt på
              enheden.
            </Alert>
          )}
          {!paused && lastError && <Alert severity="warning">Fejlede: {lastError}</Alert>}
          {notPersisted && (
            <Alert severity="info">
              Browseren kan slette data, der ikke er overført. Installér appen på hjemmeskærmen for
              at beskytte dem.
            </Alert>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'auto'}
                onChange={(event) => void setMode(event.target.checked ? 'auto' : 'manual')}
              />
            }
            label="Automatisk overførsel"
          />
          <Button variant="contained" disabled={running} onClick={() => void syncNow()}>
            Overfør nu
          </Button>
        </Stack>
      </Popover>
    </>
  );
};

export default OverfoerselMenu;
