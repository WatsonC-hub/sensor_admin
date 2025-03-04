import {SelectChangeEvent, Typography, Select, MenuItem} from '@mui/material';
import moment from 'moment';
import {useState, useEffect} from 'react';
import {useFormContext} from 'react-hook-form';

import {useUnitHistory, UnitHistory} from '~/features/stamdata/api/useUnitHistory';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import {useTimeseriesData} from '~/hooks/query/useMetadata';

import UnitEndDateDialog from './UnitEndDialog';
import FabWrapper from '~/components/FabWrapper';
import {BuildRounded} from '@mui/icons-material';
import {useAppContext} from '~/state/contexts';
import usePermissions from '~/features/permissions/api/usePermissions';

interface UdstyrReplaceProps {
  selected: number | '';
  setSelected: (selected: number | '') => void;
}

const UdstyrReplace = ({selected, setSelected}: UdstyrReplaceProps) => {
  const {ts_id, loc_id} = useAppContext(['ts_id'], ['loc_id']);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);
  const {data: timeseries} = useTimeseriesData();
  const tstype_id = timeseries?.tstype_id;
  const {setValue} = useFormContext();

  const {
    feature_permission_query: {data: permissions},
  } = usePermissions(loc_id);

  const {data, isPending} = useUnitHistory();
  const mode = data && data.length > 0 && moment(data?.[0].slutdato) > moment(new Date());
  const fabText = mode ? 'Hjemtag udstyr' : 'Tilføj udstyr';

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
              className="swiper-no-swiping"
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
      <UnitEndDateDialog openDialog={openDialog} setOpenDialog={setOpenDialog} unit={data?.[0]} />
      <AddUnitForm
        udstyrDialogOpen={openAddUdstyr}
        setUdstyrDialogOpen={setOpenAddUdstyr}
        tstype_id={tstype_id}
        mode="edit"
      />
      <FabWrapper
        icon={<BuildRounded />}
        text={fabText}
        disabled={permissions?.[ts_id] !== 'edit'}
        onClick={() => (mode ? setOpenDialog(true) : setOpenAddUdstyr(true))}
        sx={{visibility: openAddUdstyr || openDialog ? 'hidden' : 'visible'}}
      />
    </>
  );
};

export default UdstyrReplace;
