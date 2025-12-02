import {Save} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Divider,
  Collapse,
} from '@mui/material';
import React, {useState} from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';

import ExtendedAutocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import {initialContactData} from '~/consts';
import {useContactInfo, useSearchContact} from '~/features/stamdata/api/useContactInfo';
import StationContactInfo from '~/features/stamdata/components/stationDetails/contacts/StationContactInfo';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {ContactInfo} from '~/types';
import {InferContactInfo} from './api/useContactForm';

interface SelectContactInfoProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  loc_id?: number;
  onValidate?: (data: InferContactInfo) => void;
}

const SelectContactInfo = ({open, setOpen, loc_id, onValidate}: SelectContactInfoProps) => {
  const [selectedContactInfo, setSelectedContactInfo] = useState<ContactInfo | null>(null);
  const [search, setSearch] = useState<string>('');
  const deboundedSearch = useDebouncedValue(search, 500);

  const {reset, handleSubmit} = useFormContext<InferContactInfo>();
  const [createNew, setCreateNew] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const {post: postContact} = useContactInfo(loc_id);

  const {data, isFetching} = useSearchContact(loc_id, deboundedSearch);

  const handleClose = () => {
    reset(initialContactData);
    setSelectedContactInfo(null);
    setCreateNew(false);
    setOpen(false);
  };

  const handleSave: SubmitHandler<InferContactInfo> = async (contact_info) => {
    if (loc_id) {
      const payload = {
        path: `${loc_id}`,
        data: contact_info,
      };
      postContact.mutate(payload, {
        onSuccess: () => {
          reset();
          setSelectedContactInfo(null);
          setCreateNew(false);
        },
      });
    } else {
      if (onValidate) {
        onValidate(contact_info);
      }
    }

    setOpen(false);
  };

  return (
    <>
      <Grid container>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Tilføj kontakt</DialogTitle>
          <DialogContent>
            <Grid item xs={12} sm={12}>
              <ExtendedAutocomplete<ContactInfo>
                options={data ?? []}
                loading={isFetching}
                labelKey="name"
                onChange={(option) => {
                  if (option == null) {
                    setSelectedContactInfo(null);
                    reset(initialContactData);
                    setCreateNew(false);
                    return;
                  }
                  if ('id' in option) {
                    setSelectedContactInfo(option);
                    setCreateNew(true);
                    reset({
                      ...option,
                      name: option.name,
                      mobile: option.mobile ? option.mobile : null,
                      contact_role: undefined,
                      comment: '',
                    });
                  }
                }}
                selectValue={selectedContactInfo}
                filterOptions={(options) => {
                  return options;
                }}
                inputValue={search}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id + ' - ' + option.loc_id}>
                      <Box display={'flex'} flexDirection={'column'}>
                        <Typography>{option.name}</Typography>
                        <Typography fontStyle={'italic'} variant="body2">
                          {option.email}
                        </Typography>
                        <Typography fontStyle={'italic'} variant="body2">
                          {option.org && option.org !== '' && option.org}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
                textFieldsProps={{
                  label: 'Kontakt',
                  placeholder: 'Søg og vælg kontakt...',
                }}
                onInputChange={(event, value) => {
                  setSearch(value);
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
              />
            </Grid>
            <Grid item mt={1}>
              <Divider
                sx={{bgcolor: 'primary.main', paddingTop: 0.1, paddingBottom: 0.1, marginBottom: 1}}
              />
              <Button
                bttype="primary"
                onClick={() => {
                  if (createNew) {
                    reset(initialContactData);
                    setSelectedContactInfo(null);
                  }
                  setCreateNew(!createNew);
                }}
              >
                {createNew ? 'Annuller oprettelse af' : 'Opret'} kontakt
              </Button>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Collapse in={createNew}>
                <StationContactInfo
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isUser={
                    selectedContactInfo !== null &&
                    selectedContactInfo.org !== null &&
                    selectedContactInfo.org !== ''
                  }
                />
              </Collapse>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} bttype="tertiary">
              Annuller
            </Button>
            <Button
              onClick={handleSubmit(handleSave, (error) => console.log(error))}
              bttype="primary"
              startIcon={<Save />}
            >
              Gem
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

export default SelectContactInfo;
