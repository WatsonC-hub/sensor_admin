import React, {useEffect, useState} from 'react';
import {Box, Typography, Button, Divider, Grid} from '@mui/material';
import FormInput from 'src/components/FormInput';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useYRangeMutations} from 'src/hooks/query/useYRangeMutations';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteAlert from 'src/components/DeleteAlert';
import DeleteIcon from '@mui/icons-material/Delete';

const YRangeRow = ({data, index}) => {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {post, del} = useYRangeMutations();

  const schema = z.object({
    mincutoff: z.number(),
    maxcutoff: z.number(),
  });

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  useEffect(() => {
    formMethods.reset(data);
  }, [data]);

  const handleSubmit = (values) => {
    if (formMethods.formState.isDirty) {
      post.mutate({
        path: `${data.ts_id}/${data.gid}`,
        data: {
          mincuttoff: values.mincuttoff,
          maxcuttoff: values.maxcuttoff,
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
            <Typography>Tidsinterval:</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormInput
              name="mincutoff"
              label="Nedre grænse"
              fullWidth
              type="number"
              required
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="maxcutoff"
              label="Øvre grænse"
              fullWidth
              type="number"
              required
              disabled={!editMode}
            />
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
        title="Vil du slette ekskluderingen?"
        dialogOpen={confirmDelete}
        setDialogOpen={setConfirmDelete}
        onOkDelete={handleDelete}
      />
    </FormProvider>
  );
};

export default YRangeRow;
