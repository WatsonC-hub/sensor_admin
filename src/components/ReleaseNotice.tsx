import React, {useEffect, useState} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Typography,
  Link,
  Box,
  IconButton,
} from '@mui/material';
import Button from './Button';
import {Close} from '@mui/icons-material';

const RELEASE_NOTICE_KEY = 'fieldAppReleaseNotice_v2025_10';

export default function ReleaseNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(RELEASE_NOTICE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDoNotShow = () => {
    localStorage.setItem(RELEASE_NOTICE_KEY, 'dismissed');
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>✨ Ny version af felt-appen</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <DialogContentText component="div" color="black">
          <Typography gutterBottom>
            Vi har introduceret nye muligheder i appen, der giver dig større fleksibilitet med
            <strong> konfigurering af sende- og måleforhold</strong> samt
            <strong> kontrolhyppighed og forvarsling</strong> på tidsserier.
          </Typography>

          <Box component="ul" sx={{pl: 2, mt: 1, mb: 2}}>
            <li>Konfigurer sende- og måleintervaller efter egne behov</li>
            <li>Se de aktuelle standardindstillinger direkte på udstyret</li>
            <li>Få vist hvornår terminalen forventes at opsamle nye indstillinger</li>
            <li>Bestem hvor ofte kontrolmålinger skal udføres</li>
            <li>Angiv forvarslingstid så kontrolopgaver vises i god tid</li>
          </Box>

          <Typography>
            📘{' '}
            <Link
              href="https://www.watsonc.dk/guides/konfiguration-af-tidsserie/"
              target="_blank"
              rel="noopener"
            >
              Læs guiden om konfiguration
            </Link>
          </Typography>
          <Typography>
            📘{' '}
            <Link href="https://www.watsonc.dk/guides/01-10-2025/" target="_blank" rel="noopener">
              Se release notes
            </Link>
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleDoNotShow} bttype="primary" color="primary">
          VIS IKKE IGEN
        </Button>
      </DialogActions>
    </Dialog>
  );
}
