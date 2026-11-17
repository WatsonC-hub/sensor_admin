import DownloadIcon from '@mui/icons-material/Download';
import {
  Alert,
  Box,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import Button from '~/components/Button';
import {
  clearStoredTiles,
  detailPreview,
  downloadTiles,
  estimateBytes,
  formatMegabytes,
  getStoredTileCount,
  MAX_TILES,
  planDownload,
  planTiles,
  requestPersistentStorage,
} from '~/features/fieldObservation/offlineTiles';
import useOnlineStatus from '~/hooks/useOnlineStatus';

import type {
  DetailOption,
  DownloadPlan,
  DownloadProgress,
  MapView,
} from '~/features/fieldObservation/offlineTiles';

type Step =
  | {kind: 'idle'}
  | {kind: 'planned'; plan: DownloadPlan; maxZoom: number}
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

/** Preview size in CSS px. */
const FRAME = 88;

/**
 * One detail level: what the area's centre looks like fully zoomed in when this is the deepest
 * level downloaded, and the size of the download.
 */
const DetailCard = ({
  plan,
  option,
  isView,
}: {
  plan: DownloadPlan;
  option: DetailOption;
  isView: boolean;
}) => {
  const tooBig = option.tiles > MAX_TILES;
  const referenceZoom = plan.options.at(-1)?.maxZoom ?? option.maxZoom;
  const preview = detailPreview(plan.area, option.maxZoom, referenceZoom, FRAME);
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5}}>
      <Box
        sx={{
          position: 'relative',
          width: FRAME,
          height: FRAME,
          overflow: 'hidden',
          borderRadius: 1,
          bgcolor: 'grey.300',
          opacity: tooBig ? 0.4 : 1,
        }}
      >
        <Box
          component="img"
          src={preview.url}
          alt=""
          sx={{
            position: 'absolute',
            left: preview.left,
            top: preview.top,
            width: preview.size,
            height: preview.size,
            maxWidth: 'none',
          }}
        />
      </Box>
      <Typography variant="caption" sx={{lineHeight: 1.2, textTransform: 'none'}}>
        {tooBig ? 'For stort' : formatMegabytes(estimateBytes(option.tiles))}
        {isView && (
          <>
            <br />
            som nu
          </>
        )}
      </Typography>
    </Box>
  );
};

/**
 * SPIKE: download the luftfoto tiles for the area shown on the map, so it can be shown offline.
 * The user picks how detailed (the deepest zoom level), seeing the tile count and estimated
 * size of each choice, then sees progress, then what is stored.
 */
const OfflineArea = ({getMapView}: {getMapView: () => MapView | null}) => {
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
    const view = getMapView();
    if (!view) return;
    const plan = planDownload(view);
    setStep({kind: 'planned', plan, maxZoom: plan.defaultMaxZoom});
  };

  const start = async (plan: DownloadPlan, maxZoom: number) => {
    const tiles = planTiles(plan, maxZoom);
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

  const chosen =
    step.kind === 'planned'
      ? step.plan.options.find((option) => option.maxZoom === step.maxZoom)
      : undefined;

  return (
    <Box sx={{px: 2, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1}}>
      <Typography variant="body2" sx={{color: 'text.secondary'}}>
        Hent luftfoto for det viste område, så det kan ses uden net. Kun nyeste årgang.
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
        (step.plan.options.every((option) => option.tiles > MAX_TILES) ? (
          <Alert severity="warning" onClose={() => setStep({kind: 'idle'})}>
            Området er for stort. Zoom ind og prøv igen.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" sx={{fontWeight: 500}}>
              Detaljeniveau
            </Typography>
            <Typography variant="caption" sx={{color: 'text.secondary', mt: -0.5}}>
              Sådan ser midten af området ud helt zoomet ind.
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={step.maxZoom}
              onChange={(_, value: number | null) => {
                if (value !== null) setStep({...step, maxZoom: value});
              }}
              sx={{flexWrap: 'wrap', gap: 1}}
            >
              {step.plan.options.map((option, index) => (
                <ToggleButton
                  key={option.maxZoom}
                  value={option.maxZoom}
                  disabled={option.tiles > MAX_TILES}
                  aria-label={`Zoom ${option.maxZoom}`}
                  sx={{
                    p: 0.5,
                    // ToggleButtonGroup joins its buttons; these are separate cards.
                    '&&': {borderRadius: 1, border: 1, borderColor: 'divider', m: 0},
                    '&&.Mui-selected': {borderColor: 'primary.main', borderWidth: 2, p: '3px'},
                  }}
                >
                  <DetailCard plan={step.plan} option={option} isView={index === 0} />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {chosen && (
              <Typography variant="caption" sx={{color: 'text.secondary'}}>
                {chosen.tiles.toLocaleString('da-DK')} kortbrikker, ca.{' '}
                {formatMegabytes(estimateBytes(chosen.tiles))}
              </Typography>
            )}
            <Box sx={{display: 'flex', gap: 1}}>
              <Button bttype="primary" size="small" onClick={() => start(step.plan, step.maxZoom)}>
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
              (100 * (step.progress.done + step.progress.failed)) / Math.max(step.progress.total, 1)
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
