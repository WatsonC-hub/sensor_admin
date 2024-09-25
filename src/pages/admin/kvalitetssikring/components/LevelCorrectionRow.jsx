import {zodResolver} from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Divider, Grid, Typography} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import useBreakpoints from '~/hooks/useBreakpoints';

const LevelCorrectionRow = ({data, index}) => {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {put, del} = useLevelCorrection();
  const {isMobile} = useBreakpoints();

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
        flexDirection={isMobile ? 'column' : 'row'}
        alignItems="center"
        border={1}
        borderRadius={1}
        borderColor="grey.500"
        p={1}
      >
        <Grid container gap={1}>
          <Grid item xs={12} xl={4} alignSelf={'center'}>
            <Box
              alignItems={'center'}
              justifySelf={'center'}
              display="flex"
              flexDirection="row"
              gap={1}
            >
              <Typography>Tidspunkt:</Typography>
              <FormInput
                name="date"
                label="Dato"
                fullWidth
                type="datetime-local"
                required
                disabled={!editMode}
              />
            </Box>
          </Grid>
          <Grid item xs={12} xl={7}>
            <FormInput name="comment" label="Kommentar" multiline rows={2} disabled={!editMode} />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'end'}
          >
            <Box display="flex" alignSelf={'end'} flexDirection="row" gap={1} minWidth="97.02px">
              <Button
                bttype="tertiary"
                size="small"
                onClick={() => setConfirmDelete(true)}
                startIcon={<DeleteIcon />}
              >
                Slet
              </Button>
              {editMode ? (
                <Button
                  bttype="primary"
                  size="small"
                  onClick={formMethods.handleSubmit(handleSubmit, (values) => console.log(values))}
                  startIcon={<SaveIcon />}
                >
                  Gem
                </Button>
              ) : (
                <Button
                  bttype="primary"
                  size="small"
                  onClick={() => setEditMode(true)}
                  startIcon={<EditIcon />}
                >
                  Rediger
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
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
