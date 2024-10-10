import {zodResolver} from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Divider, Grid} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import {useYRangeMutations} from '~/hooks/query/useYRangeMutations';

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
    if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
      post.mutate({
        path: `${data.ts_id}`,
        data: {
          mincutoff: values.mincutoff,
          maxcutoff: values.maxcutoff,
        },
      });
    }
    setEditMode(false);
  };

  const handleDelete = () => {
    del.mutate({
      path: `${data.ts_id}`,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <Box
        key={index}
        display="flex"
        justifyContent="space-between"
        flexDirection={'column'}
        alignItems="center"
        borderRadius={1}
        borderColor="grey.500"
        p={1}
      >
        <Grid container>
          <Grid item xs={12} sm={12}>
            <Box display={'flex'} flexDirection={'row'} gap={1}>
              <FormInput
                name="mincutoff"
                label="Nedre grænse"
                fullWidth
                type="number"
                required
                disabled={!editMode}
              />
              <FormInput
                name="maxcutoff"
                label="Øvre grænse"
                fullWidth
                type="number"
                required
                disabled={!editMode}
              />
            </Box>
          </Grid>
        </Grid>
        <Box display="flex" alignSelf={'end'} flexDirection="row" gap={1}>
          {editMode ? (
            <Button bttype="tertiary" size="small" onClick={() => setEditMode(false)}>
              Annuller
            </Button>
          ) : (
            <Button
              bttype="tertiary"
              size="small"
              onClick={() => setConfirmDelete(true)}
              startIcon={<DeleteIcon />}
            >
              Slet
            </Button>
          )}
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
