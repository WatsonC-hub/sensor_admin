import Close from '@mui/icons-material/Close';
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

const RELEASE_NOTICE_KEY = 'fieldAppReleaseNotice_v2026_10';

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
      <DialogTitle sx={{pb: 0}}>✨ Nyheder i Calypso Field</DialogTitle>

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
            Vi har lavet en række forbedringer, der gør dit daglige arbejde i Calypso Field nemmere.
            Her er et overblik.
          </Typography>

          <Typography variant="h6" sx={{mt: 2}}>
            Nemmere oprettelse af lokation og tidsserier
          </Typography>
          <Box component="ul" sx={{pl: 2, mt: 1, mb: 1}}>
            <li>Opret flere tidsserier på samme lokation på én gang</li>
            <li>Tilknyt udstyr til tidsserierne med det samme - eller tilføj udstyret senere</li>
            <li>
              Opret tidsserier ud fra udstyrets sensorer med <strong>Tilføj fra udstyr</strong>
            </li>
            <li>
              Mangler du en oplysning, kan du vælge <strong>Registrer senere</strong> og gøre den
              færdig en anden dag
            </li>
          </Box>
          <Typography>
            📘{' '}
            <Link
              href="https://www.watsonc.dk/guides/opret-ny-lokation-tidsserie"
              target="_blank"
              rel="noopener"
            >
              Se guiden: Opret ny lokation/tidsserie
            </Link>
          </Typography>

          <Typography variant="h6" sx={{mt: 3}}>
            Hjemtagning og opsætning af udstyr på flere tidsserier
          </Typography>
          <Box component="ul" sx={{pl: 2, mt: 1, mb: 1}}>
            <li>Hjemtag udstyr fra flere tidsserier i én samlet hjemtagning</li>
            <li>Opsæt udstyr på flere tidsserier på én gang</li>
            <li>
              Sensorerne kobles automatisk til de rigtige tidsserier - og er der flere muligheder,
              vælger du selv
            </li>
          </Box>
          <Typography>
            📘{' '}
            <Link
              href="https://www.watsonc.dk/guides/opsaetning-af-udstyr"
              target="_blank"
              rel="noopener"
            >
              Se guiden: Opsætning af udstyr
            </Link>
          </Typography>

          <Typography variant="h6" sx={{mt: 3}}>
            Korrektion med kontrolmålinger på flere tidsserietyper
          </Typography>
          <Box component="ul" sx={{pl: 2, mt: 1, mb: 1}}>
            <li>
              Kontrolmålinger kan nu bruges til korrektion af flere tidsserietyper - ikke kun
              vandstand
            </li>
            <li>
              Afhængigt af tidsserietypen korrigeres data med enten en{' '}
              <strong>parallelforskydning</strong> eller en <strong>lineær korrektion</strong>
            </li>
            <li>
              Vælg selv, hvor langt bagud korrektionen skal gælde - også ved at vælge datoen direkte
              i grafen
            </li>
          </Box>
          <Typography>
            📘{' '}
            <Link
              href="https://www.watsonc.dk/guides/kontrolmaling-og-korrektion"
              target="_blank"
              rel="noopener"
            >
              Se guiden: Korrektion med kontrolmålinger
            </Link>
          </Typography>

          <Typography variant="h6" sx={{mt: 3}}>
            Mere fleksible tidsrum for alarmkontakter
          </Typography>
          <Typography variant="body2" sx={{color: 'text.secondary', mt: 0.5}}>
            Alarmer er for nu kun i brug hos udvalgte superbrugere af Field. Har du lyst til at
            prøve kræfter med det, så tag endelig kontakt til os.
          </Typography>
          <Box component="ul" sx={{pl: 2, mt: 1, mb: 1}}>
            <li>
              Vælg for hver kontaktmetode (SMS, e-mail og opkald), om alarmkontakten skal modtage
              alarmer <strong>hele døgnet</strong> eller i et bestemt tidsrum
            </li>
            <li>
              Tidsrummet kan nu gå <strong>over midnat</strong>, fx fra kl. 22 til kl. 6
            </li>
          </Box>
          <Typography>
            📘{' '}
            <Link href="https://www.watsonc.dk/guides/alarmer" target="_blank" rel="noopener">
              Se guiden: Alarmer
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
