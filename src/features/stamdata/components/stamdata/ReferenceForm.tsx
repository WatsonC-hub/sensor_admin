import {AddCircle} from '@mui/icons-material';
import {Box} from '@mui/material';
import moment from 'moment';
import FabWrapper from '~/components/FabWrapper';

import MaalepunktForm from '~/components/MaalepunktForm';
import MaalepunktTableDesktop from '~/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/components/tableComponents/MaalepunktTableMobile';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import useFormData from '~/hooks/useFormData';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

export default function ReferenceForm() {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const {isMobile} = useBreakpoints();
  const [showForm, setShowForm] = useShowFormState();
  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: () => moment().format('YYYY-MM-DDTHH:mm'),
    enddate: () => moment('2099-01-01').format('YYYY-MM-DDTHH:mm'),
    elevation: null,
    mp_description: '',
  });

  const {
    feature_permission_query: {data: permissions},
  } = usePermissions(loc_id);

  const disabled = permissions?.[ts_id] !== 'edit';

  const {
    get: {data: watlevmp},
    post: postWatlevmp,
    put: putWatlevmp,
    del: deleteWatlevmp,
  } = useMaalepunkt();

  const handleMaalepunktSubmit = () => {
    const mutationOptions = {
      onSuccess: () => {
        resetMpData();
        setShowForm(null);
      },
    };

    if (mpData.gid === -1) {
      const payload = {
        data: {
          ...mpData,
          startdate: moment(mpData.startdate).toISOString(),
          enddate: moment(mpData.enddate).toISOString(),
        },
        path: `${ts_id}`,
      };
      postWatlevmp.mutate(payload, mutationOptions);
    } else {
      const payload = {
        data: mpData,
        path: `${ts_id}/${mpData.gid}`,
      };
      putWatlevmp.mutate(payload, mutationOptions);
    }
  };

  const handleMpCancel = () => {
    resetMpData();
    setShowForm(null);
  };

  const handleDeleteMaalepunkt = (gid: number | undefined) => {
    deleteWatlevmp.mutate(
      {path: `${ts_id}/${gid}`},
      {
        onSuccess: () => {
          resetMpData();
        },
      }
    );
  };

  const handleEdit = (data: object) => {
    setMpData(data);
    setShowForm(true);
  };

  return (
    <>
      {showForm && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <MaalepunktForm
            formData={mpData}
            changeFormData={changeMpData}
            handleSubmit={handleMaalepunktSubmit}
            handleCancel={handleMpCancel}
          />
        </Box>
      )}
      <Box display="flex" justifyContent={{sm: 'center'}}>
        {isMobile ? (
          <MaalepunktTableMobile
            data={watlevmp}
            handleEdit={handleEdit}
            handleDelete={handleDeleteMaalepunkt}
            disabled={disabled}
          />
        ) : (
          <MaalepunktTableDesktop
            data={watlevmp}
            handleEdit={handleEdit}
            handleDelete={handleDeleteMaalepunkt}
            disabled={disabled}
          />
        )}
        <FabWrapper
          icon={<AddCircle />}
          text="Tilføj målepunkt"
          onClick={() => {
            setShowForm(true);
          }}
          disabled={permissions?.[ts_id] !== 'edit'}
          sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
        />
      </Box>
    </>
  );
}
