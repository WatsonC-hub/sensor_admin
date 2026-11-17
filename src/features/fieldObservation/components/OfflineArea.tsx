import DownloadIcon from '@mui/icons-material/Download';
import {Alert, Box, LinearProgress, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import Button from '~/components/Button';
import {
  clearStoredTiles,
  DOWNLOAD_MAX_ZOOM,
  DOWNLOAD_MIN_ZOOM,
  downloadTiles,
  estimateBytes,
  formatMegabytes,
  getStoredTileCount,
  MAX_TILES,
  planDownload,
  requestPersistentStorage,
} from '~/features/fieldObservation/offlineTiles';
import useOnlineStatus from '~/hooks/useOnlineStatus';

import type {DownloadProgress} from '~/features/fieldObservation/offlineTiles';
import type {LatLngBounds} from 'leaflet';
import type {TileInfo} from 'leaflet.offline';

type Step =
  | {kind: 'idle'}
  | {kind: 'planned'; tiles: TileInfo[]}
  | {kind: 'downloading'; progress: DownloadProgress}
  | {kind: 'finished'; progress: DownloadProgress; seconds: number; persisted: boolean};

type Storage = {tiles: number; usage: number | null; quota: number | null};

const readStorage = async (): Promise<Storage> => {
  const estimate = await navigator.storage?.estimate?.();
  return {
    tiles: await getStoredTileCount(),
    usage: estimate?.usage ?? null,
    quota: estimate?.quota ?? null,
  };
};

/**
 * SPIKE: download the luftfoto tiles for the area shown on the map, so it can be shown offline.
 * Shows the tile count and estimated size first, then progress, then what is stored.
 */
const OfflineArea = ({getMapBounds}: {getMapBounds: () => LatLngBounds | null}) => {
  const online = useOnlineStatus();
  const [step, setStep] = useState<Step>({kind: 'idle'});
  const [storage, setStorage] = useState<Storage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refreshStorage = () => readStorage().then(setStorage, () => setStorage(null));

  useEffect(() => {
    refreshStorage();
    return () => abortRef.current?.abort();
  }, []);

  const plan = () => {
    const bounds = getMapBounds();
    if (bounds) setStep({kind: 'planned', tiles: planDownload(bounds)});
  };

  const start = async (tiles: TileInfo[]) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const persisted = await requestPersistentStorage();
    const started = performance.now();
    setStep({kind: 'downloading', progress: {done: 0, failed: 0, total: tiles.length}});
    const progress = await downloadTiles(
      tiles,
      (next) => {
        if (!controller.signal.aborted) setStep({kind: 'downloading', progress: next});
      },
      controller.signal
    );
    abortRef.current = null;
    const seconds = Math.round((performance.now() - started) / 1000);
    setStep({kind: 'finished', progress, seconds, persisted});
    refreshStorage();
  };

  const clear = async () => {
    if (!window.confirm('Slet alle hentede luftfoto-kortbrikker på denne enhed?')) return;
    await clearStoredTiles();
    setStep({kind: 'idle'});
    refreshStorage();
  };

  return (
    <Box sx={{px: 2, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1}}>
      <Typography variant="body2" sx={{color: 'text.secondary'}}>
        Hent luftfoto for det viste område (zoom {DOWNLOAD_MIN_ZOOM}–{DOWNLOAD_MAX_ZOOM}), så det kan
        ses uden net. Kun nyeste årgang.
      </Typography>

      {step.kind === 'idle' && (
        <Button
          bttype="primary"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={!online}
          onClick={plan}
        >
          Hent det viste område
        </Button>
      )}

      {step.kind === 'planned' &&
        (step.tiles.length > MAX_TILES ? (
          <Alert severity="warning" onClose={() => setStep({kind: 'idle'})}>
            Området er for stort ({step.tiles.length.toLocaleString('da-DK')} kortbrikker). Zoom
            ind og prøv igen.
          </Alert>
        ) : (
          <>
            <Typography variant="body2">
              {step.tiles.length.toLocaleString('da-DK')} kortbrikker, ca.{' '}
              {formatMegabytes(estimateBytes(step.tiles.length))}.
            </Typography>
            <Box sx={{display: 'flex', gap: 1}}>
              <Button bttype="primary" size="small" onClick={() => start(step.tiles)}>
                Hent
              </Button>
              <Button bttype="tertiary" size="small" onClick={() => setStep({kind: 'idle'})}>
                Annuller
              </Button>
            </Box>
          </>
        ))}

      {step.kind === 'downloading' && (
        <>
          <LinearProgress
            variant="determinate"
            value={
              (100 * (step.progress.done + step.progress.failed)) /
              Math.max(step.progress.total, 1)
            }
          />
          <Typography variant="caption" sx={{color: 'text.secondary'}}>
            {(step.progress.done + step.progress.failed).toLocaleString('da-DK')} af{' '}
            {step.progress.total.toLocaleString('da-DK')}
            {step.progress.failed > 0 && ` · ${step.progress.failed} fejlede`}
          </Typography>
          <Button bttype="tertiary" size="small" onClick={() => abortRef.current?.abort()}>
            Stop
          </Button>
        </>
      )}

      {step.kind === 'finished' && (
        <Alert
          severity={step.progress.failed > 0 ? 'warning' : 'success'}
          onClose={() => setStep({kind: 'idle'})}
        >
          Hentede {step.progress.done.toLocaleString('da-DK')} af{' '}
          {step.progress.total.toLocaleString('da-DK')} på {step.seconds} s
          {step.progress.failed > 0 && `, ${step.progress.failed} fejlede`}.
          {!step.persisted && ' Browseren kan slette dem, hvis pladsen bliver trang.'}
        </Alert>
      )}

      {storage && (
        <Typography variant="caption" sx={{color: 'text.secondary'}}>
          Gemt: {storage.tiles.toLocaleString('da-DK')} kortbrikker
          {storage.usage !== null && ` · appen bruger ${formatMegabytes(storage.usage)}`}
          {storage.quota !== null && ` af ${formatMegabytes(storage.quota)}`}
        </Typography>
      )}
      {storage !== null && storage.tiles > 0 && step.kind !== 'downloading' && (
        <Button bttype="tertiary" size="small" onClick={clear}>
          Slet hentede kortbrikker
        </Button>
      )}
    </Box>
  );
};

export default OfflineArea;
