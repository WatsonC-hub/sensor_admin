import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Grid} from '@mui/material';
import moment from 'moment';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {LevelCorrection} from '~/types';

interface LevelCorrectionRowProps {
  data: LevelCorrection;
  index: number | undefined;
  setOpen: () => void;
}

const LevelCorrectionRow = ({data, index, setOpen}: LevelCorrectionRowProps) => {
  const {put} = useLevelCorrection();

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
    reset(data);
  }, [data]);

  const {
    reset,
    handleSubmit,
    formState: {dirtyFields},
  } = formMethods;

  const submit = (values: LevelCorrection) => {
    if (Object.keys(dirtyFields).length > 0) {
      put.mutate({
        path: `${data.ts_id}/${data.gid}`,
        data: {
          date: values.date,
          comment: values.comment,
        },
      });
    }
    setOpen();
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
        <Grid container>
          <Grid item xs={12} xl={5} alignSelf={'center'}>
            <Box
              alignItems={'center'}
              justifySelf={'center'}
              display="flex"
              flexDirection="row"
              gap={1}
            >
              <FormInput name="date" label="Dato" fullWidth type="datetime-local" required />
            </Box>
          </Grid>
          <Grid item xs={12} xl={7}>
            <FormInput name="comment" label="Kommentar" multiline rows={2} />
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
                onClick={() => {
                  reset(data);
                  setOpen();
                }}
              >
                Annuller
              </Button>
              <Button
                bttype="primary"
                size="small"
                onClick={handleSubmit(submit, (values) => console.log(values))}
                startIcon={<SaveIcon />}
              >
                Gem
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default LevelCorrectionRow;
