import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import {useUnit} from '~/features/stamdata/api/useUnit';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {toast} from 'react-toastify';
import CaptureDialog from '~/components/CaptureDialog';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {Box, Grid2, IconButton} from '@mui/material';
import dayjs from 'dayjs';
import {AddUnitType} from '~/features/createStation/forms/UnitForm';
import FormAutocomplete, {
  FormAutocompleteProps,
} from '~/components/formComponents/FormAutocomplete';
import FormDateTimeWrapper, {DatetimeProps} from '~/components/formComponents/FormDateTimeWrapper';

type StamdataUnitProps = {
  children: React.ReactNode;
  tstype_id: number | Array<number> | undefined;
};

type UnitContextType = {
  tstype_id: number | Array<number> | undefined;
  ids: {calypso_id: string}[];
};

const UnitContext = React.createContext<UnitContextType>({
  tstype_id: undefined,
  ids: [],
});

const StamdataUnit = ({children, tstype_id}: StamdataUnitProps) => {
  const {
    get: {data: availableUnits},
  } = useUnit();
  const ids = [
    ...new Set(
      availableUnits
        ?.filter((unit) =>
          Array.isArray(tstype_id)
            ? tstype_id.includes(unit.sensortypeid)
            : unit.sensortypeid === tstype_id || tstype_id == undefined
        )
        ?.map((x) => (x.calypso_id === 0 ? x.terminal_id.toString() : x.calypso_id))
    ),
  ]
    .sort((a, b) => {
      if (typeof a == 'number' && typeof b == 'number') {
        return a - b;
      } else if (typeof a == 'string' && typeof b == 'string') {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
      } else if (typeof a == 'string') {
        return 1;
      } else {
        return -1;
      }
      return 0;
    })
    .map((val) => ({
      calypso_id: typeof val == 'number' ? val.toString() : val,
    }));
  return <UnitContext.Provider value={{tstype_id, ids}}>{children}</UnitContext.Provider>;
};

type BaseInputProps = Omit<FormInputProps<AddUnitType>, 'name'>;
type AutocompleteInputProps = Omit<
  FormAutocompleteProps<AddUnitType, {calypso_id: string}, false>,
  'name' | 'labelKey' | 'valueKey' | 'options'
>;

const CalypsoID = ({textFieldsProps, gridSizes, ...rest}: AutocompleteInputProps) => {
  const {ids} = React.useContext(UnitContext);

  return (
    <Box display={'flex'} flexDirection={'row'} width={'100%'}>
      <FormAutocomplete<AddUnitType, {calypso_id: string}, false>
        labelKey="calypso_id"
        valueKey="calypso_id"
        name="calypso_id"
        fullWidth
        gridSizes={12}
        options={ids}
        textFieldsProps={{
          label: 'Calypso ID',
          placeholder: 'Søg efter calypso id',
          ...textFieldsProps,
        }}
        {...rest}
      />
      <StamdataUnit.Scanner onChangeCallback={rest.onChangeCallback} />
    </Box>
  );
};

const SensorID = ({required, ...rest}: BaseInputProps) => {
  const {watch, setValue} = useFormContext();
  const {tstype_id} = React.useContext(UnitContext);
  const {
    get: {data: availableUnits},
  } = useUnit();

  const calypso_id = watch('calypso_id');

  const uniqueAvailableUnits = Array.from(
    new Set(
      availableUnits?.filter(
        (unit) =>
          unit.sensortypeid === tstype_id &&
          (unit.calypso_id.toString() === calypso_id || unit.terminal_id === calypso_id)
      )
    )
  );

  useEffect(() => {
    if (uniqueAvailableUnits.length == 1) {
      setValue('unit_uuid', uniqueAvailableUnits[0].unit_uuid, {shouldValidate: true});
      setValue('startdate', dayjs());
    }
  }, [calypso_id]);

  return (
    <FormInput
      name="unit_uuid"
      label="Sensor ID"
      select
      placeholder="Vælg sensor id"
      options={uniqueAvailableUnits?.map((unit) => {
        return {
          [unit.unit_uuid]: `${unit.signal_id} - ${unit.sensortypename}`,
        };
      })}
      required={required}
      {...rest}
    />
  );
};

interface ScannerProps {
  onChangeCallback?: (option: {calypso_id: string} | null) => void;
}

const Scanner = ({onChangeCallback}: ScannerProps) => {
  const [openCaptureDialog, setOpenCaptureDialog] = React.useState(false);
  const {setValue} = useFormContext();
  const {tstype_id, ids} = React.useContext(UnitContext);
  const {
    get: {data: availableUnits},
  } = useUnit();

  return (
    <>
      <IconButton onClick={() => setOpenCaptureDialog(true)}>
        <QrCodeScannerIcon />
      </IconButton>
      {openCaptureDialog && (
        <CaptureDialog
          open={openCaptureDialog}
          handleClose={() => setOpenCaptureDialog(false)}
          handleScan={(data: any, calypso_id: number | null) => {
            if (calypso_id === null) {
              toast.error('Ugyldigt Calypso ID');
              setOpenCaptureDialog(false);
              return;
            }

            if (!ids.find((val) => val.calypso_id == calypso_id.toString())) {
              toast.error(`Ingen tilgængelige enheder med Calypso ID: ${calypso_id}`);
              setOpenCaptureDialog(false);
              return;
            }
            const unit = Array.from(
              new Set(
                availableUnits?.filter(
                  (unit) => unit.sensortypeid === tstype_id && unit.calypso_id === calypso_id
                )
              )
            );

            if (onChangeCallback) onChangeCallback({calypso_id: calypso_id.toString()});
            setValue('calypso_id', calypso_id.toString());

            if (unit.length === 1) {
              setValue('unit_uuid', unit[0].unit_uuid);
            }

            setOpenCaptureDialog(false);
          }}
        />
      )}
    </>
  );
};

type BaseDateProps = Omit<DatetimeProps<AddUnitType>, 'name'>;

const StartDate = ({required, gridSizes, ...rest}: BaseDateProps) => {
  return (
    <FormDateTimeWrapper
      name="startdate"
      label="Fra"
      required={required}
      {...rest}
      gridSizes={gridSizes ?? 12}
    />
  );
};

const EndDate = ({required, gridSizes, ...rest}: BaseDateProps) => {
  return (
    <FormDateTimeWrapper
      name="enddate"
      label="Slut dato"
      required={required}
      {...rest}
      gridSizes={gridSizes ?? 12}
    />
  );
};

StamdataUnit.CalypsoID = CalypsoID;
StamdataUnit.SensorID = SensorID;
StamdataUnit.StartDate = StartDate;
StamdataUnit.EndDate = EndDate;
StamdataUnit.Scanner = Scanner;

export default StamdataUnit;
