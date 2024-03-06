import {Box, Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import {useContext, useState} from 'react';
import {useYRangeMutations} from '~/hooks/query/useYRangeMutations';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

const YRangeModal = ({open, onClose}) => {
  const selection = useAtomValue(qaSelection);
  const y1 = selection?.selections?.[0]?.y1;
  const y0 = selection?.selections?.[0]?.y0;

  const [minY, setMinY] = useState(Math.min(y1, y0).toFixed(4));
  const [maxY, setMaxY] = useState(Math.max(y1, y0).toFixed(4));
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  const {post: yRangeMutation} = useYRangeMutations();

  const onAccept = () => {
    yRangeMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {mincutoff: Number(minY), maxcutoff: Number(maxY)},
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Valide værdier</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Område: {metadata?.unit}</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'left',
              gap: 0.5,
            }}
          >
            <TextField
              label="Minimum"
              variant="outlined"
              value={minY}
              size="small"
              type="number"
              onChange={(e) => setMinY(e.target.value)}
              sx={{maxWidth: '120px'}}
            />
            <Typography gutterBottom> - </Typography>
            <TextField
              label="Maximum"
              variant="outlined"
              value={maxY}
              size="small"
              type="number"
              onChange={(e) => setMaxY(e.target.value)}
              sx={{maxWidth: '120px'}}
            />
            <Typography gutterBottom> {metadata?.unit}</Typography>
          </Box>
          <Typography gutterBottom>
            <b>Obs:</b> Denne ændring vil gøre at alle punkter udenfor disse værdier vil blive
            fjernet automatisk
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fortryd</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">
            Bekræft
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default YRangeModal;
