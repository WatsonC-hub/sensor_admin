import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DeleteIcon from '@mui/icons-material/Delete';
import {Box, Dialog, IconButton, Stack, TextField, Tooltip, Typography} from '@mui/material';
import {useLiveQuery} from 'dexie-react-hooks';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import {deleteImage, updateImageNote} from '~/features/fieldObservation/localWrites';
import {resizePhoto, serverImageUrl} from '~/features/fieldObservation/photos';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {LocalImage} from '~/features/fieldObservation/types';

/** A photo picked in the form but not saved yet: it is written to the device on Gem. */
export type StagedPhoto = {
  key: string;
  data: ArrayBuffer;
  mime: string;
  takenAt: string | null;
  note: string;
  url: string;
};

/** One photo as the tiles and the viewer show it. */
type Shown = {
  key: string;
  thumb: string | null;
  full: string | null;
  note: string | null;
  /** Saved on the device but not overført, or picked but not saved. */
  status: 'staged' | 'local' | null;
};

const FULL_SIZE = 2048;

const useImages = (db: FieldObservationDb, observationId: string | null) =>
  useLiveQuery(
    () =>
      observationId
        ? db.images
            .where('observation_id')
            .equals(observationId)
            .filter((image) => !image.deleted_at)
            .sortBy('created_at')
        : [],
    [db, observationId],
    []
  );

/** A local photo is shown from its own bytes; other photos come from the server's proxy. */
const useShownImages = (images: LocalImage[]): Shown[] => {
  const shown = useMemo(
    () =>
      images.map((image): Shown => {
        const local = image.data
          ? URL.createObjectURL(new Blob([image.data], {type: image.mime_type}))
          : null;
        return {
          key: image.id,
          thumb: local ?? (image.s3_key ? serverImageUrl(image.s3_key) : null),
          full: local ?? (image.s3_key ? serverImageUrl(image.s3_key, FULL_SIZE) : null),
          note: image.note,
          status: image.bytes_uploaded === 0 || image.dirty !== 0 ? 'local' : null,
        };
      }),
    [images]
  );
  useEffect(
    () => () =>
      shown.forEach((photo) => {
        if (photo.thumb?.startsWith('blob:')) URL.revokeObjectURL(photo.thumb);
      }),
    [shown]
  );
  return shown;
};

type ViewerProps = {
  photos: Shown[];
  start: number;
  onClose: () => void;
  /** Given when comments can be edited. */
  onNoteChange?: (key: string, note: string | null) => void;
};

/** A photo in fullscreen, with arrows between photos and its comment below. */
const PhotoViewer = ({photos, start, onClose, onNoteChange}: ViewerProps) => {
  const [index, setIndex] = useState(start);
  const photo = photos[Math.min(index, photos.length - 1)];
  if (!photo) return null;
  const step = (by: number) => setIndex((index + by + photos.length) % photos.length);
  const arrowSx = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    bgcolor: 'rgba(0,0,0,0.4)',
  } as const;

  return (
    <Dialog
      open
      fullScreen
      onClose={onClose}
      slotProps={{paper: {sx: {bgcolor: 'black', display: 'flex', flexDirection: 'column'}}}}
    >
      <IconButton
        aria-label="Luk"
        onClick={onClose}
        sx={{position: 'absolute', top: 8, right: 8, zIndex: 1, color: 'white'}}
      >
        <CloseIcon />
      </IconButton>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {photo.full && (
          <Box
            component="img"
            src={photo.full}
            alt={photo.note ?? 'Billede'}
            sx={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
          />
        )}
        {photos.length > 1 && (
          <>
            <IconButton aria-label="Forrige" onClick={() => step(-1)} sx={{...arrowSx, left: 8}}>
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <IconButton aria-label="Næste" onClick={() => step(1)} sx={{...arrowSx, right: 8}}>
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </>
        )}
      </Box>
      <Box sx={{p: 2, bgcolor: 'background.paper'}}>
        {onNoteChange ? (
          <TextField
            // A new field per photo, so each starts from its own comment.
            key={photo.key}
            size="small"
            fullWidth
            label="Kommentar"
            defaultValue={photo.note ?? ''}
            onBlur={(event) => onNoteChange(photo.key, event.target.value.trim() || null)}
          />
        ) : (
          <Typography variant="body2">
            {photo.note ?? ''}
            {photos.length > 1 && (
              <Typography component="span" variant="caption" sx={{color: 'text.secondary', ml: 1}}>
                {index + 1} / {photos.length}
              </Typography>
            )}
          </Typography>
        )}
      </Box>
    </Dialog>
  );
};

const Tile = ({
  photo,
  size,
  onOpen,
  onDelete,
}: {
  photo: Shown;
  size: number;
  onOpen: () => void;
  onDelete?: () => void;
}) => (
  <Box sx={{position: 'relative', width: size, height: size, flexShrink: 0}}>
    <Box
      component="button"
      type="button"
      aria-label="Vis billedet i fuld størrelse"
      onClick={onOpen}
      sx={{
        width: '100%',
        height: '100%',
        p: 0,
        border: 0,
        cursor: 'zoom-in',
        borderRadius: 1,
        bgcolor: 'grey.200',
        backgroundImage: photo.thumb ? `url(${photo.thumb})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
    {photo.status && (
      <Tooltip title={photo.status === 'staged' ? 'Gemmes, når du trykker Gem' : 'Ikke overført'}>
        <Box
          sx={{
            position: 'absolute',
            left: 4,
            bottom: 4,
            px: 0.5,
            borderRadius: 1,
            bgcolor: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {photo.status === 'staged' ? (
            <Typography variant="caption">Ny</Typography>
          ) : (
            <CloudOffIcon sx={{fontSize: 14, color: 'warning.main'}} />
          )}
        </Box>
      </Tooltip>
    )}
    {onDelete && (
      <IconButton
        size="small"
        aria-label="Slet billede"
        onClick={onDelete}
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          bgcolor: 'rgba(255,255,255,0.85)',
          '&:hover': {bgcolor: 'white'},
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
);

type Props = {
  db: FieldObservationDb;
  /** Null for a feltobservation that isn't saved yet. */
  observationId: string | null;
  disabled: boolean;
  staged: StagedPhoto[];
  onStagedChange: (staged: StagedPhoto[]) => void;
};

/**
 * Photos in Rediger, as tiles. New photos are kept in the form and saved with Gem, also on a
 * new feltobservation. Already saved photos: comment (in the fullscreen view) and delete apply
 * at once.
 */
const ObservationPhotos = ({db, observationId, disabled, staged, onStagedChange}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const saved = useShownImages(useImages(db, observationId));
  const [open, setOpen] = useState<number | null>(null);

  const all: Shown[] = [
    ...saved,
    ...staged.map((photo): Shown => ({
      key: photo.key,
      thumb: photo.url,
      full: photo.url,
      note: photo.note || null,
      status: 'staged',
    })),
  ];
  const isStaged = (key: string) => staged.some((photo) => photo.key === key);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const added: StagedPhoto[] = [];
    for (const file of Array.from(files)) {
      try {
        // One photo at a time, so several full-size originals are never in memory together.
        // oxlint-disable-next-line no-await-in-loop
        const photo = await resizePhoto(file);
        added.push({
          key: crypto.randomUUID(),
          ...photo,
          note: '',
          url: URL.createObjectURL(new Blob([photo.data], {type: photo.mime})),
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Kunne ikke læse billedet');
      }
    }
    onStagedChange([...staged, ...added]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const remove = (key: string) => {
    if (isStaged(key)) {
      const photo = staged.find((candidate) => candidate.key === key);
      if (photo) URL.revokeObjectURL(photo.url);
      onStagedChange(staged.filter((candidate) => candidate.key !== key));
    } else if (window.confirm('Slet billedet?')) {
      void deleteImage(db, key);
    }
  };

  const changeNote = (key: string, note: string | null) => {
    if (isStaged(key)) {
      onStagedChange(
        staged.map((photo) => (photo.key === key ? {...photo, note: note ?? ''} : photo))
      );
    } else if (note !== (saved.find((photo) => photo.key === key)?.note ?? null)) {
      void updateImageNote(db, key, note);
    }
  };

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'center'}}>
        {all.map((photo, index) => (
          <Tile
            key={photo.key}
            photo={photo}
            size={88}
            onOpen={() => setOpen(index)}
            onDelete={disabled ? undefined : () => remove(photo.key)}
          />
        ))}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />
        {!disabled && (
          <Button
            bttype="tertiary"
            startIcon={<AddAPhotoIcon />}
            onClick={() => inputRef.current?.click()}
          >
            Tilføj billede
          </Button>
        )}
      </Stack>
      {open !== null && (
        <PhotoViewer
          photos={all}
          start={open}
          onClose={() => setOpen(null)}
          onNoteChange={disabled ? undefined : changeNote}
        />
      )}
    </Stack>
  );
};

/** Photos in Vis: a row of thumbnails; a tap opens the photo in fullscreen. */
export const PhotoStrip = ({
  db,
  observationId,
}: {
  db: FieldObservationDb;
  observationId: string;
}) => {
  const photos = useShownImages(useImages(db, observationId));
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;
  return (
    <>
      <Stack direction="row" spacing={1} sx={{overflowX: 'auto', pb: 0.5}}>
        {photos.map((photo, index) => (
          <Tile key={photo.key} photo={photo} size={88} onOpen={() => setOpen(index)} />
        ))}
      </Stack>
      {open !== null && <PhotoViewer photos={photos} start={open} onClose={() => setOpen(null)} />}
    </>
  );
};

export default ObservationPhotos;
