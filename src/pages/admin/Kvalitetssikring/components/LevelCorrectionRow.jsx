import {zodResolver} from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Button, Divider, Grid, Typography} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import * as z from 'zod';

const LevelCorrectionRow = ({data, index}) => {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {put, del} = useLevelCorrection();

  const schema = z.object({
    date: z
      .string()
      .min(1, {message: 'Dato ugyldig'})
      .transform((value) => moment(value).toISOString()),
    comment: z.string().min(0).max(255, {message: 'Maks 255 tegn'}),
  });

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  useEffect(() => {
    formMethods.reset(data);
  }, [data]);

  const handleSubmit = (values) => {
    if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
      put.mutate({
        path: `${data.ts_id}/${data.gid}`,
        data: {
          date: values.date,
          comment: values.comment,
        },
      });
    }
    setEditMode(false);
  };

  const handleDelete = () => {
    del.mutate({
      path: `${data.ts_id}/${data.gid}`,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <Box
        key={index}
        display="flex"
        justifyContent="space-between"
        flexDirection={'row'}
        alignItems="center"
        border={1}
        borderRadius={1}
        borderColor="grey.500"
        p={1}
      >
        <Grid container width="70%">
          <Grid item xs={12} sm={12}>
            <Typography>Tidspunkt:</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="date"
              label="Dato"
              fullWidth
              type="datetime-local"
              required
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput name="comment" label="Kommentar" multiline rows={2} disabled={!editMode} />
          </Grid>
        </Grid>
        <Box display="flex" flexDirection="column" gap={1} minWidth="97.02px">
          {editMode ? (
            <Button
              color="success"
              variant="contained"
              size="small"
              onClick={formMethods.handleSubmit(handleSubmit, (values) => console.log(values))}
              startIcon={<SaveIcon />}
              // disabled={isSubmitting}
              //   sx={{alignSelf: 'center'}}
            >
              Gem
            </Button>
          ) : (
            <Button
              color="secondary"
              variant="contained"
              size="small"
              onClick={() => setEditMode(true)}
              startIcon={<EditIcon />}
              // disabled={isSubmitting}
              //   sx={{alignSelf: 'center'}}
            >
              Rediger
            </Button>
          )}
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={() => setConfirmDelete(true)}
            startIcon={<DeleteIcon />}
          >
            Slet
          </Button>
        </Box>
      </Box>
      <Divider />
      <DeleteAlert
        title="Vil du slette spring korrektionen?"
        dialogOpen={confirmDelete}
        setDialogOpen={setConfirmDelete}
        onOkDelete={handleDelete}
      />
    </FormProvider>
  );
};

export default LevelCorrectionRow;
