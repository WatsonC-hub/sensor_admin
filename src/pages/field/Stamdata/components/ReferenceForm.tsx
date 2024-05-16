import {useEffect, useState} from 'react';
import MaalepunktForm from '~/components/MaalepunktForm';
import MaalepunktTable from '../../Station/MaalepunktTable';
import useFormData from '~/hooks/useFormData';
import moment from 'moment';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';

interface Props {
  mode: string;
  setMode: (form: string) => void;
  canEdit: boolean;
  ts_id: number;
}

export default function ReferenceForm({mode, setMode, canEdit, ts_id}: Props) {
  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: moment(),
    enddate: moment('2099-01-01'),
    elevation: 0,
    mp_description: '',
  });

  const {
    get: {data: watlevmp},
    post: postWatlevmp,
    put: putWatlevmp,
    del: deleteWatlevmp,
  } = useMaalepunkt();

  const handleMaalepunktSubmit = () => {
    mpData.startdate = moment(mpData.startdate).toISOString();
    mpData.enddate = moment(mpData.enddate).toISOString();

    const mutationOptions = {
      onSuccess: (data: []) => {
        resetMpData();
        setMode('view');
      },
    };

    if (mpData.gid === -1) {
      const payload = {
        data: mpData,
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
    setMode('view');
  };

  const handleDeleteMaalepunkt = (gid: string) => {
    deleteWatlevmp.mutate(
      {path: `${ts_id}/${gid}`},
      {
        onSuccess: (data) => {
          resetMpData();
        },
      }
    );
  };

  const handleEdit = (type: string) => {
    if (type === 'watlevmp') {
      return (data: any) => {
        setMpData(data);
        setMode('add');
      };
    }
  };
  return (
    <>
      {mode === 'add' && canEdit && (
        <MaalepunktForm
          formData={mpData}
          changeFormData={changeMpData}
          handleSubmit={handleMaalepunktSubmit}
          handleCancel={handleMpCancel}
        />
      )}
      {mode === 'view' && (
        <MaalepunktTable
          watlevmp={watlevmp}
          handleEdit={handleEdit('watlevmp')}
          handleDelete={handleDeleteMaalepunkt}
          canEdit={canEdit}
        />
      )}
    </>
  );
}
