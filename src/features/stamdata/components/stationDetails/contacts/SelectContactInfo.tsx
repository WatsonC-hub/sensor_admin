import {Save} from '@mui/icons-material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import {initialContactData} from '~/consts';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import {MetadataContext} from '~/state/contexts';
import {stamdataStore} from '~/state/store';
import {ContactInfo} from '~/types';

import StationContactInfo from './StationContactInfo';

const SelectContactInfo = () => {
  const contact_info_id = stamdataStore((store) => store.stationDetails.contact_info.id);
  const [selectedContactInfo, setSelectedContactInfo] = useState<ContactInfo | null>(null);
  const [search, setSearch] = useState<string>('');
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);

  const {getValues, trigger, setValue, clearErrors} = useFormContext();
  const metadata = useContext(MetadataContext);
  const loc_id: number | undefined = metadata?.loc_id;

  const {useSearchContact, post: postContact} = useContactInfo(loc_id);

  const {data} = useSearchContact(search);

  useEffect(() => {
    if (contact_info_id && data) {
      const contact_info = data.find((item: ContactInfo) => item.id === contact_info_id);
      if (contact_info) setValue('contact_info', contact_info);
    }
  }, [contact_info_id, data, setValue]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = () => {
    setValue('contact_info', initialContactData);
    setSelectedContactInfo(null);
    clearErrors('contact_info');
    setOpenContactInfoDialog(false);
  };

  const handleSave = async () => {
    const result = await trigger('contact_info');
    const details = getValues().contact_info;
    const test = {
      id: details.id ?? null,
      navn: details.navn,
      telefonnummer: details.telefonnummer ?? null,
      email: details.email,
      kommentar: details.kommentar,
      rolle: details.rolle,
      user_id: details.user_id ?? null,
    };
    if (result) {
      const payload = {
        path: `${loc_id}`,
        data: test,
      };
      postContact.mutate(payload, {
        onSuccess: () => {
          setValue('contact_info', initialContactData);
          setSelectedContactInfo(null);
        },
      });
    }

    setOpenContactInfoDialog(!result);
  };

  return (
    <>
      <Grid item xs={matches ? 12 : 6} md={6} sm={matches ? 6 : 12}>
        <Box>
          <Button
            size="small"
            color="primary"
            bttype="primary"
            sx={matches ? {ml: 1} : {textTransform: 'none', ml: '12px'}}
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenContactInfoDialog(true)}
          >
            Tilføj kontakt
          </Button>
        </Box>
      </Grid>
      <Grid container>
        <Dialog
          open={openContactInfoDialog}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Tilføj kontakt</DialogTitle>
          <DialogContent>
            <Autocomplete
              value={selectedContactInfo}
              options={data ?? []}
              getOptionLabel={(option) => {
                let optionName = '';
                optionName += option.navn ? option.navn : '';
                optionName += option.email ? ' - ' + option.email : '';
                optionName += option.loc_id ? ' - ' + option.loc_id : '';
                return optionName;
              }}
              inputValue={search}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.id}>
                    <Box display={'flex'} flexDirection={'column'}>
                      <Typography>{option.navn}</Typography>
                      <Box display={'flex'} flexDirection={'row'} mx={2} gap={1}>
                        <Typography variant="body2">{option.email}</Typography>
                        <Typography variant="body2">
                          {option.loc_id && option.loc_id !== -1 && 'loc_id: ' + option.loc_id}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                );
              }}
              isOptionEqualToValue={(option, value) => option && value && option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  InputLabelProps={{shrink: true}}
                  variant="outlined"
                  label="Kontakt"
                  placeholder="Vælg Kontakt"
                  sx={{
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#000000',
                    },
                    '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                    '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
                    '& .MuiOutlinedInput-root': {
                      '& > fieldset': {borderColor: 'primary.main'},
                    },
                  }}
                />
              )}
              disableClearable={matches}
              style={matches ? {width: '100%'} : {width: 400, marginTop: '12px'}}
              onChange={(event, value) => {
                if (data) {
                  let contactInfo = null;
                  contactInfo = data.find(
                    (contact) => contact.id === value?.id || contact.id === contact_info_id
                  );
                  if (contactInfo) {
                    setSelectedContactInfo(contactInfo);
                    setValue('contact_info', contactInfo);
                  } else {
                    setValue('contact_info', initialContactData);
                    setSelectedContactInfo(null);
                  }
                }
              }}
              onInputChange={(event, value) => {
                setSearch(value);
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
            />
            <Grid item mt={1}>
              <Divider sx={{bgcolor: 'secondary.light', paddingTop: 0.1, paddingBottom: 0.1}} />
            </Grid>
            <StationContactInfo
              modal={true}
              isUser={
                selectedContactInfo && selectedContactInfo.org && selectedContactInfo.org !== ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} bttype="tertiary">
              Annuller
            </Button>
            <Button onClick={handleSave} bttype="primary" startIcon={<Save />}>
              Gem
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

export default SelectContactInfo;
