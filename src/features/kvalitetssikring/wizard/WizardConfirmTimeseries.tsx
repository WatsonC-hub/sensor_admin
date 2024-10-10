import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import AdsClickIcon from '@mui/icons-material/AdsClick';
// import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import {Box, CardContent, TextField, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {PlotDatum} from 'plotly.js';
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
  setStep: (value: number) => void;
  initiateConfirmTimeseries: boolean;
  setInitiateConfirmTimeseries: (confirmTimeseries: boolean) => void;
}

const schema = z.object({
  id: z.number().optional(),
  date: z.string(),
  level: z.number(),
  // comment: z.string().optional(),
});

type CertifyQaValues = z.infer<typeof schema>;

const WizardConfirmTimeseries = ({
  // setStep,
  initiateConfirmTimeseries,
  setInitiateConfirmTimeseries,
}: WizardConfirmTimeseriesProps) => {
  const metadata = useContext(MetadataContext);
  const [qaStamp, setQaStamp] = useState<number | undefined>(undefined);
  const {isMobile} = useBreakpoints();
  const selection = useAtomValue(qaSelection);
  const [disabled, setDisabled] = useState(false);
  // const disabled = !initiateConfirmTimeseries || !('points' in selection);

  const {
    get: {data: qaData},
    post: postQaData,
  } = useCertifyQa(metadata?.ts_id);

  const [selectedQaData, setSelectedQaData] = useState<CertifyQa | undefined>();

  const formMethods = useForm<CertifyQaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 1,
    },
  });

  const {watch, handleSubmit, setValue, reset} = formMethods;

  const qaStampWatch = watch('level');

  useEffect(() => {
    if (qaStampWatch !== qaStamp) {
      setQaStamp(qaStampWatch);
      setSelectedQaData(qaData?.find((qa) => qa.level === qaStampWatch));
    }
  }, [qaStampWatch, qaStamp, qaData]);

  useEffect(() => {
    setDisabled(!initiateConfirmTimeseries || !true);
    if ('points' in selection) {
      const x = (selection.points as Array<PlotDatum>)[0].x;
      if (x) setValue('date', moment(x.toString()).format('YYYY-MM-DD HH:mm'));
    }
  }, [initiateConfirmTimeseries, selection]);

  const handleSave: SubmitHandler<CertifyQaValues> = async (certifyQa) => {
    const payload = {
      path: `${metadata?.ts_id}`,
      data: certifyQa,
    };
    postQaData.mutateAsync(payload);
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
          <Box display={'flex'} flexDirection="column" mb={3} justifyContent={'center'}>
            <Typography alignSelf={'center'} variant="h5" component="h2" fontWeight={'bold'}>
              Markere tidsserie som godkendt
            </Typography>
            <Typography sx={{wordWrap: 'break-word'}}>
              På denne side af guiden har du mulighed for at godkende tidsserien. Hvis du er sikker
              på at der ikke mangler ændringer eller fejlhåndtering og at tidsserien er klar til at
              blive godtkendt, så tryk på knappen nedenfor.
            </Typography>
          </Box>
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            width={'100%'}
            alignSelf={'center'}
            gap={1}
          >
            <Button
              startIcon={<AdsClickIcon />}
              bttype={'primary'}
              disabled={false}
              onClick={() => {
                setInitiateConfirmTimeseries(true);
              }}
            >
              Markér punkt
            </Button>
            <Box
              display={'flex'}
              width={'100%'}
              flexDirection={'row'}
              alignItems={'center'}
              flexWrap={'wrap'}
              justifyContent={isMobile ? 'start' : 'center'}
              gap={1}
            >
              <TextField
                value={
                  selectedQaData
                    ? moment(selectedQaData.date).format('YYYY-MM-DD HH:mm')
                    : undefined
                }
                type={selectedQaData ? 'datetime-local' : undefined}
                variant="outlined"
                label={'Sidst godkendt'}
                placeholder="Fra start"
                fullWidth
                InputLabelProps={{shrink: true}}
                disabled={true}
                style={{
                  minWidth: 195,
                  width: isMobile ? 'fit-content' : 195,
                }}
              />
              <FormInput
                name="date"
                label="Godkendt til"
                type={'datetime-local'}
                disabled={disabled}
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

            <Box display={'flex'} flexDirection={'row'} alignSelf={'center'} gap={1}>
              <Button
                bttype="tertiary"
                onClick={() => {
                  reset();
                  setInitiateConfirmTimeseries(false);
                }}
              >
                Annuller
              </Button>
              <Button bttype="primary" startIcon={<Save />} onClick={handleSubmit(handleSave)}>
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
