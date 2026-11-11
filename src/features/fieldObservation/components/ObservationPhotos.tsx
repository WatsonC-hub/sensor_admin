import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import DeleteIcon from '@mui/icons-material/Delete';
import {Box, Button, IconButton, Stack, TextField, Typography} from '@mui/material';
import {useLiveQuery} from 'dexie-react-hooks';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {addImage, deleteImage, updateImageNote} from '~/features/fieldObservation/localWrites';
import {resizePhoto, serverImageUrl} from '~/features/fieldObservation/photos';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {LocalImage} from '~/features/fieldObservation/types';

/** A local photo is shown from its own bytes; other photos come from the server. */
const usePhotoUrl = (image: LocalImage) => {
  const url = useMemo(() => {
    if (image.data) return URL.createObjectURL(new Blob([image.data], {type: image.mime_type}));
    return image.s3_key ? serverImageUrl(image.s3_key) : null;
  }, [image.data, image.mime_type, image.s3_key]);
  useEffect(
    () => () => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    },
    [url]
  );
  return url;
};

const Photo = ({
  db,
  image,
  disabled,
}: {
  db: FieldObservationDb;
  image: LocalImage;
  disabled: boolean;
}) => {
  const url = usePhotoUrl(image);
  const [note, setNote] = useState(image.note ?? '');

  return (
    <Stack direction="row" spacing={1} sx={{alignItems: 'flex-start'}}>
      <Box
        sx={{
          width: 96,
          height: 96,
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: 'grey.200',
          backgroundImage: url ? `url(${url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Stack sx={{flex: 1, minWidth: 0}}>
        <TextField
          size="small"
          label="Kommentar"
          value={note}
          disabled={disabled}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => {
            const value = note.trim() || null;
            if (value !== image.note) void updateImageNote(db, image.id, value);
          }}
          multiline
        />
        <Typography variant="caption" sx={{color: 'text.secondary'}}>
          {image.dirty === -1
            ? `Afvist: ${image.sync_error}`
            : image.bytes_uploaded === 0
              ? 'Billedet er ikke overført'
              : image.dirty === 1
                ? 'Kommentaren er ikke overført'
                : 'Overført'}
        </Typography>
      </Stack>
      <IconButton
        aria-label="Slet billede"
        disabled={disabled}
        onClick={() => void deleteImage(db, image.id)}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

type Props = {
  db: FieldObservationDb;
  observationId: string;
  disabled: boolean;
};

const ObservationPhotos = ({db, observationId, disabled}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const images = useLiveQuery(
    () =>
      db.images
        .where('observation_id')
        .equals(observationId)
        .filter((image) => !image.deleted_at)
        .sortBy('created_at'),
    [db, observationId],
    []
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    let saved = 0;
    for (const file of Array.from(files)) {
      try {
        // One photo at a time, so several full-size originals are never in memory together.
        // oxlint-disable-next-line no-await-in-loop
        await addImage(db, observationId, await resizePhoto(file), null);
        saved += 1;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Kunne ikke gemme billedet');
      }
    }
    if (saved > 0) toast.success(saved === 1 ? 'Billedet er gemt' : `${saved} billeder er gemt`);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Stack spacing={1.5}>
      <Stack>
        <Typography variant="subtitle2">Billeder</Typography>
        <Typography variant="caption" sx={{color: 'text.secondary'}}>
          Billeder og kommentarer gemmes med det samme – du skal ikke trykke Gem.
        </Typography>
      </Stack>
      {images.map((image) => (
        <Photo key={image.id} db={db} image={image} disabled={disabled} />
      ))}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <Button
        variant="outlined"
        startIcon={<AddAPhotoIcon />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        sx={{alignSelf: 'flex-start'}}
      >
        Tilføj billede
      </Button>
    </Stack>
  );
};

export default ObservationPhotos;
