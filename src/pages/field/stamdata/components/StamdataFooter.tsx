import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import {Box} from '@mui/material';
import React, {useState} from 'react';

import AlertDialog from '~/components/AlertDialog';
import Button from '~/components/Button';

interface Props {
  disabled?: boolean;
  cancel: () => void;
  nextTab?: () => void;
  handleOpret: () => void;
  type?: string;
  saveTitle?: string;
}

const StamdataFooter = ({cancel, nextTab, handleOpret, disabled, type, saveTitle}: Props) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  console.log(disabled);
  const handleSubmit = async () => {
    setShowAlert(true);
    setAlertTitle('Opret ' + type);
    setAlertMessage(
      'Du er i gang med at kun oprette ' + type + '. Er du sikker på at du vil fortsætte?'
    );
  };

  return (
    <footer style={{position: 'sticky', bottom: 0, float: 'right', zIndex: 1}}>
      {type && (
        <AlertDialog
          open={showAlert}
          setOpen={setShowAlert}
          title={alertTitle}
          message={alertMessage}
          handleOpret={handleOpret}
        />
      )}
      <Box display="flex" gap={1} justifyContent="flex-end" justifySelf="end">
        <Button bttype="tertiary" onClick={cancel}>
          Annuller
        </Button>
        {nextTab && (
          <Button
            bttype="primary"
            sx={{marginRight: 1}}
            onClick={nextTab}
            endIcon={<ArrowForwardIcon fontSize="small" />}
          >
            <Box display="flex" alignItems="center">
              Videre
            </Box>
          </Button>
        )}
        <Button
          bttype="primary"
          disabled={disabled}
          onClick={type ? handleSubmit : handleOpret}
          startIcon={<SaveIcon />}
          sx={{marginRight: 1}}
        >
          {saveTitle ?? 'Gem'}
        </Button>
      </Box>
    </footer>
  );
};

export default StamdataFooter;
