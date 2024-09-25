import {Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useContext, useState} from 'react';

import Button from '~/components/Button';
import {useExclude} from '~/hooks/query/useExclude';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

const ExcludeModal = ({onClose}) => {
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
  const y0 = selection?.selections?.[0]?.y0;
  const y1 = selection?.selections?.[0]?.y1;

  const [startDate, setStartDate] = useState(moment.min(x0, x1));
  const [endDate, setEndDate] = useState(moment.max(x0, x1));
  const [startValue, setStartValue] = useState(Math.min(y0, y1).toFixed(4));
  const [endValue, setEndValue] = useState(Math.max(y0, y1).toFixed(4));

  const {post: excludeMutation} = useExclude();

  const onAccept = () => {
    excludeMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {
        startdate: startDate.toISOString(),
        enddate: endDate.toISOString(),
        min_value: radio == 'selected' ? Number(startValue) : null,
        max_value: radio == 'selected' ? Number(endValue) : null,
        comment: comment,
      },
    });
  };

  return (
    <div>
      <Box display={'flex'} flexDirection={'column'} alignItems={'start'} gap={1}>
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
          <Typography variant="h6">Tidsinterval:</Typography>
          <TextField
            value={startDate.format('YYYY-MM-DD HH:mm')}
            type="datetime-local"
            onChange={(event) => {
              setStartDate(moment(event.target.value));
            }}
          />
          -
          <TextField
            value={endDate.format('YYYY-MM-DD HH:mm')}
            type="datetime-local"
            onChange={(event) => {
              setEndDate(moment(event.target.value));
            }}
          />
        </Box>
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
          <Typography variant="h6">Værdi-interval:</Typography>
          <TextField
            value={startValue}
            type="number"
            onChange={(event) => {
              setStartValue(event.target.value);
            }}
          />
          -
          <TextField
            value={endValue}
            type="number"
            onChange={(event) => {
              setEndValue(event.target.value);
            }}
          />
        </Box>
        <TextField
          label="Kommentar"
          variant="outlined"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Box>

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
          <FormControlLabel control={<Radio />} label="Alt inden for tidsstempler" value="all" />
        </RadioGroup>
      </FormControl>
      {radio == 'selected' && (
        <Typography gutterBottom>Ekskluderer {selection.points.length} punkter</Typography>
      )}
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
        <Button bttype="tertiary" onClick={onClose} sx={{marginRight: 1}}>
          Fortryd
        </Button>
        <Button bttype="primary" onClick={handleSubmit} color="secondary">
          Ekskluder
        </Button>
      </Box>
    </div>
  );
};

export default ExcludeModal;
