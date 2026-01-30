import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useUnit} from '~/features/stamdata/api/useAddUnit';
import FormInput, {FormInputProps} from '~/components/FormInput';
import FormDateTime, {FormDateTimeProps} from '~/components/FormDateTime';
import {toast} from 'react-toastify';
import CaptureDialog from '~/components/CaptureDialog';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {IconButton, InputAdornment} from '@mui/material';
import dayjs from 'dayjs';
import {AddUnitType} from '~/features/createStation/forms/UnitForm';

type StamdataUnitProps = {
  children: React.ReactNode;
  tstype_id: number | undefined;
};

type UnitContextType = {
  tstype_id: number | undefined;
};

const UnitContext = React.createContext<UnitContextType>({
  tstype_id: undefined,
});

const StamdataUnit = ({children, tstype_id}: StamdataUnitProps) => {
  return <UnitContext.Provider value={{tstype_id}}>{children}</UnitContext.Provider>;
};

type BaseInputProps = Omit<FormInputProps<AddUnitType>, 'name'>;

const CalypsoID = ({required, ...rest}: BaseInputProps) => {
  const {
    get: {data: availableUnits},
  } = useUnit();
  const {tstype_id} = React.useContext(UnitContext);
  const {setValue} = useFormContext();
  const ids = Array.from(
    new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((unit) => (unit.calypso_id == 0 ? unit.terminal_id : unit.calypso_id))
    )
  );

  return (
    <FormInput
      name="calypso_id"
      label="Calypso ID"
      select
      options={ids.map((id) => {
        return {
          [id]: id.toString(),
        };
      })}
      required={required}
      onChangeCallback={(value) => {
        const calypso_id = (value as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
          .target.value;
        const unit = Array.from(
          new Set(
            availableUnits?.filter(
              (unit) =>
                unit.sensortypeid === tstype_id &&
                (unit.calypso_id.toString() === calypso_id || unit.terminal_id === calypso_id)
            )
          )
        );

        if (unit.length === 1) {
          setValue('unit_uuid', unit[0].unit_uuid);
          setValue('startdate', dayjs());
        } else {
          setValue('unit_uuid', '');
          setValue('startdate', dayjs());
        }
      }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="start" sx={{pr: 1}}>
              <StamdataUnit.Scanner />
            </InputAdornment>
          ),
        },
      }}
      {...rest}
    />
  );
};

const SensorID = ({required, ...rest}: BaseInputProps) => {
  const {watch} = useFormContext();
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

  return (
    <FormInput
      name="unit_uuid"
      label="Sensor ID"
      select
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

const Scanner = () => {
  const [openCaptureDialog, setOpenCaptureDialog] = React.useState(false);
  const {setValue} = useFormContext();
  const {tstype_id} = React.useContext(UnitContext);
  const {
    get: {data: availableUnits},
  } = useUnit();

  const ids = Array.from(
    new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((unit) => (unit.calypso_id == 0 ? unit.terminal_id : unit.calypso_id))
    )
  );

  return (
    <>
      <IconButton onClick={() => setOpenCaptureDialog(true)} size="large">
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

            if (!ids.includes(calypso_id.toString())) {
              toast.error(`Ingen tilgængelige enheder med Calypso ID: ${calypso_id}`);
              setOpenCaptureDialog(false);
              return;
            }
            const unit = Array.from(
              new Set(
                availableUnits?.filter(
                  (unit) =>
                    unit.sensortypeid === tstype_id &&
                    (unit.calypso_id === calypso_id || unit.terminal_id === calypso_id.toString())
                )
              )
            );
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

type BaseDateProps = Omit<FormDateTimeProps<AddUnitType>, 'name'>;

const StartDate = ({required, ...rest}: BaseDateProps) => {
  return <FormDateTime name="startdate" label="Fra" required={required} {...rest} />;
};

StamdataUnit.CalypsoID = CalypsoID;
StamdataUnit.SensorID = SensorID;
StamdataUnit.StartDate = StartDate;
StamdataUnit.Scanner = Scanner;

export default StamdataUnit;
