import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Grid} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useYRangeMutations} from '~/hooks/query/useYRangeMutations';

type YRangeData = {
  ts_id: number;
  mincutoff: number;
  maxcutoff: number;
};

interface YRangeRowProps {
  data: YRangeData;
  setOpen: () => void;
}

const YRangeRow = ({data, setOpen}: YRangeRowProps) => {
  const {post} = useYRangeMutations();

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
    setOpen();
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
              <FormInput name="mincutoff" label="Nedre grænse" fullWidth type="number" required />
              <FormInput name="maxcutoff" label="Øvre grænse" fullWidth type="number" required />
            </Box>
          </Grid>
        </Grid>
        <Box display="flex" alignSelf={'end'} flexDirection="row" gap={1}>
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
      </Box>
    </FormProvider>
  );
};

export default YRangeRow;
