import {zodResolver} from '@hookform/resolvers/zod';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Divider, Grid} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import FormInput from '~/components/FormInput';
import {ExcludeData, useExclude} from '~/hooks/query/useExclude';
import useBreakpoints from '~/hooks/useBreakpoints';

interface ExcludeRowProps {
  data: ExcludeData;
  index: number;
  isWithYValues?: boolean;
  lastElement: boolean;
}

const ExcludeRow = ({data, index, isWithYValues = false, lastElement}: ExcludeRowProps) => {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {put, del} = useExclude();
  const {isTouch, isLaptop} = useBreakpoints();

  let schema = z.object({
    startdate: z
      .string()
      .min(1, {message: 'Dato ugyldig'})
      .transform((value) => moment(value).toISOString()),
    enddate: z
      .string()
      .min(1, {message: 'Dato ugyldig'})
      .transform((value) => moment(value).toISOString()),
    comment: z.string().min(0).max(255, {message: 'Maks 255 tegn'}),
  });

  if (isWithYValues) {
    schema = schema.extend({
      min_value: z.number({
        invalid_type_error: 'Feltet må ikke være tom',
      }),
      max_value: z.number({
        invalid_type_error: 'Feltet må ikke være tom',
      }),
    });
  }
  console.log(data);

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const {
    reset,
    formState: {dirtyFields},
    handleSubmit,
  } = formMethods;

  useEffect(() => {
    reset(data);
  }, [data]);

  const submit = (values: ExcludeData) => {
    if (Object.keys(dirtyFields).length > 0) {
      put.mutate({
        path: `${data.ts_id}/${data.gid}`,
        data: {
          startdate: values.startdate,
          enddate: values.enddate,
          comment: values.comment,
          min_value: values.min_value,
          max_value: values.max_value,
        },
      });
    }
    setEditMode(false);
  };

  const handleDelete = () => {
    console.log(data);
    del.mutate({
      path: `${data.ts_id}/${data.gid}`,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <Box
        key={index}
        display="flex"
        flexDirection={'row'}
        alignItems="center"
        borderRadius={1}
        borderColor="grey.500"
        p={1}
      >
        <Grid container gap={1}>
          <Grid item xs={12} sm={12} alignSelf={'center'}>
            <Box
              alignItems={'center'}
              alignSelf={'center'}
              display="flex"
              flexDirection={isLaptop || isTouch ? 'column' : 'row'}
              gap={1}
            >
              <FormInput
                name="startdate"
                label="Fra"
                type="datetime-local"
                required
                disabled={!editMode}
              />
              <FormInput
                name="enddate"
                label="Til"
                type="datetime-local"
                required
                disabled={!editMode}
              />
            </Box>
          </Grid>
          {isWithYValues && (
            <>
              <Grid item xs={12} sm={12}>
                <Box display={'flex'} flexDirection={'row'} gap={1} alignItems={'center'}>
                  <FormInput
                    name="min_value"
                    label="Min værdi"
                    fullWidth
                    type="number"
                    required
                    style={{alignSelf: 'center'}}
                    placeholder="Brug venligst kun tal"
                    disabled={!editMode}
                  />
                  -
                  <FormInput
                    name="max_value"
                    label="Max værdi"
                    fullWidth
                    type="number"
                    required
                    placeholder="Brug venligst kun tal"
                    disabled={!editMode}
                  />
                </Box>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={12}>
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
            <Box display="flex" flexDirection="row" alignSelf={'end'} gap={1}>
              {editMode ? (
                <Button
                  bttype="tertiary"
                  size="small"
                  onClick={() => {
                    reset(data);
                    setEditMode(false);
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
          </Grid>
        </Grid>
      </Box>
      {!lastElement && (
        <Divider
          sx={{
            mt: 1,
            mb: 1,
            borderBottomWidth: 2,
          }}
        />
      )}
      <DeleteAlert
        title="Vil du slette ekskluderingen?"
        dialogOpen={confirmDelete}
        setDialogOpen={setConfirmDelete}
        onOkDelete={handleDelete}
      />
    </FormProvider>
  );
};

export default ExcludeRow;
