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

const RELEASE_NOTICE_KEY = 'fieldAppReleaseNotice_v2026_02';

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
      <DialogTitle>✨ Opdatering til målepunkter</DialogTitle>
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
            Vi har ændret på hvordan målepunkter fungerer for at gøre brugen af målepunkter mere{' '}
            <strong>intuitiv</strong> og <strong>robust</strong>.
          </Typography>

          <Box component="ul" sx={{pl: 2, mt: 1, mb: 2}}>
            <li>
              Målepunkter bliver nu kun registreret med en <strong>gældende fra</strong>-dato
            </li>
            <li>Et målepunkt gælder altid fra denne dato og frem til dato for næste målepunkt</li>
            <li>Seneste målepunkt gælder dermed frem indtil et nyt målepunkt bliver defineret</li>
            <li>Dette gør at der ikke kommer nogle huller, hvor et målepunkt ikke er defineret</li>
          </Box>

          <Typography>
            📘{' '}
            <Link
              href="https://www.watsonc.dk/guides/malepunkter-vandstand/"
              target="_blank"
              rel="noopener"
            >
              Læs guide om målepunkter
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
