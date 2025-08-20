import {SelectChangeEvent, Typography, Select, MenuItem} from '@mui/material';
import moment from 'moment';
import {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';

import {useUnitHistory, UnitHistory} from '~/features/stamdata/api/useUnitHistory';

interface UdstyrReplaceProps {
  selected: number | '';
  setSelected: (selected: number | '') => void;
}

const UdstyrReplace = ({selected, setSelected}: UdstyrReplaceProps) => {
  const {setValue} = useFormContext();

  const {data, isPending} = useUnitHistory();

  // const [selected, setSelected] = useState<number | ''>(data?.[0]?.gid ?? '');

  const onSelectionChange = (data: UnitHistory[], gid: number | '') => {
    const localUnit = data.filter((elem) => elem.gid === gid)[0];
    const unit = localUnit ?? data[0];
    // setUnit(unit);
    setValue(
      'unit',
      {
        gid: unit.gid,
        unit_uuid: unit.uuid,
        startdate: moment(unit.startdato).format('YYYY-MM-DDTHH:mm'),
        enddate: moment(unit.slutdato).format('YYYY-MM-DDTHH:mm'),
      },
      {shouldValidate: true, shouldDirty: true}
    );
    setSelected(unit.gid);
  };

  const handleChange = (event: SelectChangeEvent<number | null>) => {
    if (selected !== event.target.value && data) setSelected(Number(event.target.value));
  };

  useEffect(() => {
    if (data && data.length > 0) {
      onSelectionChange(data, selected === '' ? data[0].gid : selected);
    }
  }, [data, selected]);

  return (
    <>
      {isPending && (
        <Typography align={'center'} display={'inline-block'}>
          Henter udstyr...
        </Typography>
      )}
      {!isPending && (
        <>
          {data && data.length > 0 ? (
            <Select
              id="udstyr_select"
              value={
                data.map((item) => item.gid).includes(selected == '' ? 0 : selected) ? selected : ''
              }
              onChange={handleChange}
            >
              {data?.map((item) => {
                const endDate =
                  moment(new Date()) < moment(item.slutdato)
                    ? 'nu'
                    : moment(item?.slutdato).format('YYYY-MM-DD HH:mm');

                return (
                  <MenuItem id={item.gid.toString()} key={item.gid.toString()} value={item.gid}>
                    {`${moment(item?.startdato).format('YYYY-MM-DD HH:mm')} - ${endDate}`}
                  </MenuItem>
                );
              })}
            </Select>
          ) : (
            <Typography align={'center'} display={'inline-block'}>
              Tilknyt venligst et udstyr
            </Typography>
          )}
        </>
      )}
    </>
  );
};

export default UdstyrReplace;
