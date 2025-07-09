import {zodResolver} from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import {Box, Grid} from '@mui/material';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import * as z from 'zod';

import Button from '~/components/Button';
import FormDateTime from '~/components/FormDateTime';
import FormInput from '~/components/FormInput';
import {zodDayjs} from '~/helpers/schemas';
import {ExcludeData, useExclude} from '~/hooks/query/useExclude';
import useBreakpoints from '~/hooks/useBreakpoints';

interface ExcludeRowProps {
  data: ExcludeData;
  index: number | undefined;
  isWithYValues?: boolean;
  setOpen: (open: boolean) => void;
}

const ExcludeRow = ({data, index, isWithYValues = false, setOpen}: ExcludeRowProps) => {
  const {put} = useExclude();
  const {isTouch, isLaptop} = useBreakpoints();

  const schema = z.object({
    startdate: zodDayjs('Dato fra er påkrævet'),
    enddate: zodDayjs('Dato til er påkrævet'),
    comment: z.string().min(0).max(255, {message: 'Maks 255 tegn'}),
    min_value: isWithYValues
      ? z.number({
          invalid_type_error: 'Feltet må ikke være tom',
        })
      : z
          .number({
            invalid_type_error: 'Feltet må ikke være tom',
          })
          .nullable(),
    max_value: isWithYValues
      ? z.number({
          invalid_type_error: 'Feltet må ikke være tom',
        })
      : z
          .number({
            invalid_type_error: 'Feltet må ikke være tom',
          })
          .nullable(),
  });

  const {data: parsedData} = schema.safeParse(data);

  const formMethods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: parsedData,
  });

  const {
    reset,
    formState: {dirtyFields},
    handleSubmit,
  } = formMethods;

  const submit = (values: z.infer<typeof schema>) => {
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
    setOpen(false);
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
              <FormDateTime name="startdate" label="Fra" required />
              <FormDateTime name="enddate" label="Til" required />
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
                  />
                  -
                  <FormInput
                    name="max_value"
                    label="Max værdi"
                    fullWidth
                    type="number"
                    required
                    placeholder="Brug venligst kun tal"
                  />
                </Box>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={12}>
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
            <Box display="flex" flexDirection="row" alignSelf={'end'} gap={1}>
              <Button
                bttype="tertiary"
                size="small"
                onClick={() => {
                  reset(parsedData);
                  setOpen(false);
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

export default ExcludeRow;
