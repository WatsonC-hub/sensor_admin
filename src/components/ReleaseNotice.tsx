import {Close} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import React, {useEffect, useState} from 'react';

import Button from './Button';

const RELEASE_NOTICE_KEY = 'fieldAppReleaseNotice_v2026_08';

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
      <DialogTitle sx={{pb: 0}}>
        ✨ Nyt flow til oprettelse af lokation og hjemtagning og opsætning af udstyr i Calypso Field
      </DialogTitle>

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
            Vi har moderniseret oprettelsen af lokationer og tidsserier for at gøre arbejdsgangen
            mere <strong>fleksibel</strong> og <strong>enkel</strong>.
          </Typography>

          <Box component="ul" sx={{pl: 2, mt: 1, mb: 2}}>
            <li>
              Opret nu <strong>flere tidsserier</strong> i samme flow
            </li>
            <li>
              Tilknyt udstyr direkte til tidsserier – eller <strong>tilføj udstyr senere</strong>
            </li>
            <li>
              Opret tidsserier direkte fra udstyr med <strong>Tilføj fra udstyr</strong>
            </li>
            <li>
              Mangler du oplysninger, kan du vælge <strong>Registrer senere</strong>
            </li>
          </Box>
          <Typography>
            📘{' '}
            <Link
              href="https://www.watsonc.dk/guides/opret-ny-lokation-tidsserie"
              target="_blank"
              rel="noopener"
            >
              Læs mere om det nye oprettelses-flow
            </Link>
          </Typography>

          <Typography gutterBottom sx={{mt: 2}}>
            Vi har samtidig gjort det lettere at arbejde med flere tidsserier på én gang:
          </Typography>

          <Box component="ul" sx={{pl: 2, mt: 1, mb: 2}}>
            <li>
              <strong>Hjemtag flere tidsserier</strong> i én samlet proces, så du ikke behøver at
              gennemføre hjemtagningen flere gange
            </li>
            <li>
              <strong>Opsæt flere tidsserier</strong> på én gang med automatisk matchning af
              sensorer, hvor det er muligt
            </li>
            <li>
              Vælg selv, hvilke tidsserier der skal opsættes, og hvilken sensor der skal bruges, når
              der er flere muligheder
            </li>
          </Box>

          <Typography>
            📘{' '}
            <Link href="https://www.watsonc.dk/guides/udstyre" target="_blank" rel="noopener">
              Læs mere om det nye hjemtagning og opsætnings-flow
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
