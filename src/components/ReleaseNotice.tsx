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

const RELEASE_NOTICE_KEY = 'fieldAppReleaseNotice_v2025_08';

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
            Vi har lanceret en ny og forbedret version af appen med fokus på{' '}
            <strong>hurtigere navigation</strong>, <strong>bedre overblik</strong> og{' '}
            <strong>nye funktioner</strong> til din hverdag – både i felten og på kontoret.
          </Typography>

          <Box component="ul" sx={{pl: 2, mt: 1, mb: 2}}>
            <li>Ny navigation og layout – alt samlet ét sted</li>
            <li>Flydende vinduer oven på kortet</li>
            <li>Opdateret kort med bedre ikoner og visuelle forbedringer</li>
            <li>Forbedret søgning og filtrering</li>
            <li>Nye visninger: lokationer i kortudsnit</li>
            <li>Hjælpetekster og links til dokumentation i appen</li>
          </Box>

          <Typography>
            📘{' '}
            <Link href="https://www.watsonc.dk/guides/oversigt/" target="_blank" rel="noopener">
              Bliv klogere på den nye app
            </Link>
          </Typography>
          <Typography>
            📘{' '}
            <Link href="https://www.watsonc.dk/guides/01-09-2025/" target="_blank" rel="noopener">
              Læs release notes
            </Link>
          </Typography>
          <br />
          <Typography>
            ⚠️ <strong>OBS!</strong> Har du stadig brug for den gamle version? Linket til denne
            finder du ved at trykke på de 3 prikker oppe i højre hjørne
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
