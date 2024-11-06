import {Save} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {parseAsString, useQueryState} from 'nuqs';
import {useContext, useState} from 'react';

import Button from '~/components/Button';
import {limitDecimalNumbers} from '~/helpers/dateConverter';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

interface LevelCorrectionModal {
  onClose: () => void;
}

const LevelCorrectionModal = ({onClose}: LevelCorrectionModal) => {
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onAccept();
    onClose();
  };
  console.log(selection);
  const unit = metadata && 'unit' in metadata ? (metadata.unit as string) : '';
  const prevY = (
    selection?.points?.[0]?.data?.y[selection?.points?.[0]?.pointIndex - 1] as number
  )?.toFixed(4);
  const prevX = moment(
    selection?.points?.[0]?.data?.x[selection?.points?.[0]?.pointIndex - 1] as string
  );
  const y = (selection?.points?.[0]?.y as number)?.toFixed(4);
  const x = moment(selection?.points?.[0]?.x);

  const {post: levelCorrectionMutation} = useLevelCorrection();

  const onAccept = () => {
    levelCorrectionMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {date: x.toISOString(), comment: comment},
    });
  };

  return (
    <div>
      <Typography gutterBottom>
        Korrigerer grafen fremadrettet ved at sætte det nuværende punkt lig med det forrige punkt
      </Typography>
      <Box>
        {prevY === undefined ? (
          <Typography gutterBottom fontWeight={'bold'}>
            Ingen forrige datapunkt
          </Typography>
        ) : (
          <Box display={'flex'} flexDirection={'row'}>
            <b style={{width: 150}}>Forrige punkt:</b>
            <Typography gutterBottom>
              {prevX.format('YYYY-MM-DD HH:mm')} - {limitDecimalNumbers(parseInt(prevY)) + ' '}
              {unit}
            </Typography>
          </Box>
        )}
        <Box display={'flex'} flexDirection={'row'}>
          <b style={{width: 150}}>Nuværende punkt:</b>
          <Typography gutterBottom>
            {x.format('YYYY-MM-DD HH:mm')} - {limitDecimalNumbers(parseInt(y)) + ' '} {unit}
          </Typography>
        </Box>
      </Box>
      <TextField
        label="Kommentar"
        InputLabelProps={{shrink: true, style: {zIndex: 0}}}
        variant="outlined"
        className="swiper-no-swiping"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        multiline
        fullWidth
        placeholder="Kommentar..."
        rows={3}
        sx={{
          mt: 1,
        }}
      />
      <Box display={'flex'} flexDirection={'row'} justifyContent={'end'} m={1} gap={1}>
        <Button
          bttype="tertiary"
          onClick={() => {
            setDataAdjustment(null);
            onClose();
          }}
        >
          Annuller
        </Button>
        <Button bttype="primary" onClick={handleSubmit} startIcon={<Save />} color="secondary">
          Gem
        </Button>
      </Box>
    </div>
  );
};

export default LevelCorrectionModal;
