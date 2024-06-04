import {FormControl, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useContext, useState} from 'react';

import {useExclude} from '~/hooks/query/useExclude';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

const ExcludeModal = ({open, onClose}) => {
  const [radio, setRadio] = useState('selected');
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  const x0 = moment(selection?.selections?.[0]?.x0);
  const x1 = moment(selection?.selections?.[0]?.x1);
  const minX = moment.min(x0, x1);
  const maxX = moment.max(x0, x1);

  const y0 = selection?.selections?.[0]?.y0;
  const y1 = selection?.selections?.[0]?.y1;

  const minY = Math.min(y0, y1).toFixed(4);
  const maxY = Math.max(y0, y1).toFixed(4);

  const {post: excludeMutation} = useExclude();

  const onAccept = () => {
    excludeMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {
        startdate: minX.toISOString(),
        enddate: maxX.toISOString(),
        min_value: radio == 'selected' ? Number(minY) : null,
        max_value: radio == 'selected' ? Number(maxY) : null,
        comment: comment,
      },
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Ekskluder</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Tid:</Typography>
          <Typography gutterBottom>
            {minX.format('YYYY-MM-DD HH:mm')} - {maxX.format('YYYY-MM-DD HH:mm')}
          </Typography>
          <Typography variant="h6">Værdi:</Typography>
          <Typography gutterBottom>
            {minY} - {maxY}
          </Typography>

          <TextField
            label="Kommentar"
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <Typography gutterBottom>
            Vil du fjerne alt inden for de to tidsstempler, eller kun de valgte punkter?
          </Typography>
          <FormControl>
            <RadioGroup
              aria-label="exclude"
              name="exclude"
              value={radio}
              onChange={(e) => setRadio(e.target.value)}
            >
              <FormControlLabel control={<Radio />} label="Valgte punkter" value="selected" />
              <FormControlLabel
                control={<Radio />}
                label="Alt inden for tidsstempler"
                value="all"
              />
            </RadioGroup>
          </FormControl>
          {radio == 'selected' && (
            <Typography gutterBottom>Ekskluderer {selection.points.length} punkter</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fortryd</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">
            Ekskluder
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExcludeModal;
