import React from 'react';
import {useFormContext} from 'react-hook-form';
import {AddUnit} from '../../schema';
import {useUnit} from '~/features/stamdata/api/useAddUnit';
import FormInput from '~/components/FormInput';
import FormDateTime from '~/components/FormDateTime';

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

// const Unit = () => {
//   const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
//   const {tstype_id} = React.useContext(UnitContext);
//   return (
//     <Box>
//       <AddUnitForm
//         mode="add"
//         udstyrDialogOpen={udstyrDialogOpen}
//         setUdstyrDialogOpen={setUdstyrDialogOpen}
//         tstype_id={tstype_id}
//       />
//     </Box>
//   );
// };

const CalypsoID = () => {
  const {
    get: {data: availableUnits},
  } = useUnit();
  const {tstype_id} = React.useContext(UnitContext);

  const uniqueCalypsoIDs = Array.from(
    new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((unit) =>
          unit.calypso_id === 0 ? unit.terminal_id.toString() : unit.calypso_id.toString()
        )
    )
  );

  return (
    <FormInput
      name="calypso_id"
      label="Calypso ID"
      select
      options={uniqueCalypsoIDs?.map((calypso_id) => ({[calypso_id]: calypso_id}))}
    />
  );
};

const SensorID = () => {
  const {watch} = useFormContext<AddUnit>();
  const {tstype_id} = React.useContext(UnitContext);
  const {
    get: {data: availableUnits},
  } = useUnit();

  const selectedCalypsoID = watch('calypso_id');

  const uniqueAvailableUnits = Array.from(
    new Set(
      availableUnits?.filter(
        (unit) =>
          unit.sensortypeid === tstype_id &&
          (unit.calypso_id.toString() === selectedCalypsoID ||
            unit.terminal_id.toString() === selectedCalypsoID)
      )
    )
  );

  return (
    <FormInput
      name="sensor_id"
      label="Sensor ID"
      select
      options={uniqueAvailableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((unit) => ({
          [unit.sensor_id]: `${unit.channel} - ${unit.sensor_id}`,
        }))}
    />
  );
};

const StartDate = () => {
  return <FormDateTime name="startdate" label="Fra" />;
};

// StamdataUnit.Unit = Unit;
StamdataUnit.CalypsoID = CalypsoID;
StamdataUnit.SensorID = SensorID;
StamdataUnit.StartDate = StartDate;

export default StamdataUnit;
