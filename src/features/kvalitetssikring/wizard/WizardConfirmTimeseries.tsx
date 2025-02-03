import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
// import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, CardContent, Tooltip, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {parseAsString, useQueryState} from 'nuqs';
import React, {useContext, useEffect, useState} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
// import {QaStampLevel} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

import {CertifyQa, useCertifyQa} from '../api/useCertifyQa';

interface WizardConfirmTimeseriesProps {
  initiateConfirmTimeseries: boolean;
  onClose: () => void;
}

const schema = z
  .object({
    id: z.number().optional(),
    startDate: z.string().optional(),
    date: z.string(),
    level: z.number(),
    // comment: z.string().optional(),
  })
  .refine(
    ({date, startDate}) => {
      return !startDate || (startDate && startDate < date);
    },
    {
      path: ['date'],
      message: 'Dato må ikke være tidligere end sidst godkendt',
    }
  );

type CertifyQaValues = z.infer<typeof schema>;

const WizardConfirmTimeseries = ({
  initiateConfirmTimeseries,
  onClose,
}: WizardConfirmTimeseriesProps) => {
  const metadata = useContext(MetadataContext);
  const [qaStamp, setQaStamp] = useState<number | undefined>(undefined);
  const {isMobile} = useBreakpoints();
  const selection = useAtomValue(qaSelection);

  const {
    get: {data: qaData},
    post: postQaData,
  } = useCertifyQa(metadata?.ts_id);

  const [selectedQaData, setSelectedQaData] = useState<CertifyQa | undefined>();
  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const formMethods = useForm<CertifyQaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: selectedQaData?.date,
      level: 1,
    },
    mode: 'onTouched',
  });

  const {watch, handleSubmit, setValue} = formMethods;

  const qaStampWatch = watch('level');
  const enddateWatch = watch('date');

  useEffect(() => {
    if (qaStampWatch !== qaStamp) {
      setQaStamp(qaStampWatch);
      setSelectedQaData(qaData?.find((qa) => qa.level === qaStampWatch));
    }
  }, [qaStampWatch, qaStamp, qaData]);

  useEffect(() => {
    if (selection.points && selection.points.length > 0) {
      const x = selection.points[0].x;
      if (x) setValue('date', moment(x.toString()).format('YYYY-MM-DD HH:mm'));
    } else {
      setValue('date', '');
    }
  }, [selection]);

  useEffect(() => {
    if (selectedQaData) {
      setValue('startDate', selectedQaData.date);
    }
  }, [selectedQaData]);

  const handleSave: SubmitHandler<CertifyQaValues> = async (certifyQa) => {
    const payload = {
      path: `${metadata?.ts_id}`,
      data: certifyQa,
    };
    postQaData.mutateAsync(payload);
    onClose();
  };
  return (
    <FormProvider {...formMethods}>
      <Box alignSelf={'center'} width={'inherit'} height={'inherit'} justifySelf={'center'}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'inherit',
            alignContent: 'center',
          }}
        >
          <Box display={'flex'} flexDirection="row" justifyContent={'center'} mb={1} gap={1}>
            <Typography
              alignSelf={'center'}
              variant={isMobile ? 'h6' : 'h5'}
              component="h2"
              fontWeight={'bold'}
            >
              Godkend tidsserie
            </Typography>
            <Tooltip
              placement="right"
              enterTouchDelay={0}
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'primary.main',
                  },
                },
                arrow: {
                  sx: {
                    color: 'primary.main',
                  },
                },
              }}
              arrow={true}
              title={
                <p>
                  Markér et punkt på grafen som du gerne vil godkende tidsserien frem til. Datoen
                  vil blive brugt som tidsstempel for hvornår tidsserien sidst er blevet godkendt
                </p>
              }
              sx={{alignSelf: 'center'}}
            >
              <InfoOutlinedIcon color="info" />
            </Tooltip>
          </Box>
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            width={'100%'}
            alignSelf={'center'}
            gap={1}
          >
            <Box
              display={'flex'}
              width={'100%'}
              flexDirection={'row'}
              alignItems={'center'}
              flexWrap={'wrap'}
              justifyContent={'center'}
              gap={1}
            >
              <FormInput
                name={'startDate'}
                type={selectedQaData ? 'datetime-local' : undefined}
                variant="outlined"
                label={'Sidst godkendt'}
                placeholder="Fra start"
                fullWidth
                disabled={true}
                style={{
                  minWidth: 195,
                  width: isMobile ? 'fit-content' : 195,
                }}
              />
              <FormInput
                name="date"
                label="Godkend til"
                type={'datetime-local'}
                disabled={!initiateConfirmTimeseries}
                style={{
                  minWidth: 195,
                  width: isMobile ? 'fit-content' : 195,
                }}
              />
            </Box>
            {/* <FormInput
              name="qa_stamp"
              label="Kvalitetsniveau"
              placeholder="Kvalitetsniveau..."
              disabled={disabled}
              select
              style={{
                minWidth: 195,
                width: isMobile ? 'fit-content' : 400,
                alignSelf: isMobile ? 'start' : 'center',
              }}
            >
              <MenuItem value={-1} key={-1}>
                Vælg kvalitetsniveau
              </MenuItem>
              {Object.entries(QaStampLevel).map((entry) => (
                <MenuItem key={entry[0]} value={entry[1]}>
                  {entry[1]}
                </MenuItem>
              ))}
            </FormInput>
            <FormInput
              name="comment"
              label="Kommentar"
              multiline
              disabled={disabled}
              rows={3}
              placeholder="Kommentar"
              style={{
                minWidth: 218,
                width: isMobile ? '100%' : 400,
              }}
            /> */}

            <Box display={'flex'} mt={2.5} flexDirection={'row'} alignSelf={'center'} gap={1}>
              <Button
                bttype="tertiary"
                onClick={() => {
                  setDataAdjustment(null);
                  onClose();
                  // reset();
                }}
              >
                Annuller
              </Button>
              <Button
                bttype="primary"
                startIcon={<Save />}
                disabled={
                  moment(selectedQaData?.date).isAfter(enddateWatch) &&
                  selectedQaData?.date != undefined
                }
                onClick={handleSubmit(handleSave, (e) => {
                  console.log(e);
                })}
              >
                Godkend
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Box>
    </FormProvider>
  );
};

export default WizardConfirmTimeseries;
