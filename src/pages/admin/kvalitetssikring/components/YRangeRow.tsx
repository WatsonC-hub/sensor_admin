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

type YRangeData = {
  ts_id: number;
  mincutoff: number;
  maxcutoff: number;
};

interface YRangeRowProps {
  data: YRangeData;
}

const YRangeRow = ({data}: YRangeRowProps) => {
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

  const {
    reset,
    handleSubmit,
    formState: {dirtyFields},
  } = formMethods;

  useEffect(() => {
    reset(data);
  }, [data]);

  const submit = (values: YRangeData) => {
    if (Object.keys(dirtyFields).length > 0) {
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
            <Button
              bttype="tertiary"
              size="small"
              onClick={() => {
                setEditMode(false);
                reset(data);
              }}
            >
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
              onClick={handleSubmit(submit, (values) => console.log(values))}
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
