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
} from '@mui/material';
import Button from './Button';

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
    localStorage.setItem(RELEASE_NOTICE_KEY, 'dismissed');
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>✨ Ny version af felt-appen</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
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
          <Typography>
            🕰 Har du stadig brug for den gamle version? Linket til denne finder du ved at trykke på
            de 3 prikker oppe i højre hjørne
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} bttype="primary" color="primary">
          Forstået
        </Button>
      </DialogActions>
    </Dialog>
  );
}
