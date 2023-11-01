import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React from 'react';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import useFormData from '../hooks/useFormData';
import TilsynForm from './TilsynForm';
import TilsynTable from './TilsynTable';

const TilsynPage = ({ts_id, setFormToShow, canEdit}) => {
  const queryClient = useQueryClient();
  const [serviceData, setServiceData, changeServiceData, resetServiceData] = useFormData({
    gid: -1,
    dato: moment(),
    batteriskift: false,
    tilsyn: false,
    kommentar: '',
  });

  const {data: services} = useQuery(
    ['service', ts_id],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/service/${ts_id}`);

      return data.map((m) => {
        return {...m, dato: moment(m.dato).format('YYYY-MM-DD HH:mm:ss')};
      });
    },
    {
      enabled: ts_id !== -1 && ts_id !== null,
      initialData: [],
    }
  );

  const serviceMutate = useMutation((data) => {
    if (data.gid === -1) {
      return apiClient.post(`/sensor_field/station/service/${ts_id}`, data);
    } else {
      return apiClient.put(`/sensor_field/station/service/${ts_id}/${data.gid}`, data);
    }
  });

  const serviceDelete = useMutation(
    (gid) => {
      return apiClient.delete(`/sensor_field/station/service/${ts_id}/${gid}`);
    },
    {
      onSuccess: (data) => {
        toast.success('Tilsyn slettet');
        resetServiceData();
        queryClient.invalidateQueries(['service', ts_id]);
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    }
  );

  const handleServiceSubmit = () => {
    // setFormToShow("ADDTILSYN");
    const payload = {
      ...serviceData,
      batteriskift: serviceData.batteriskift.toString(),
      tilsyn: serviceData.tilsyn.toString(),
    };

    payload.dato = moment(payload.dato).toISOString();

    serviceMutate.mutate(payload, {
      onSuccess: (data) => {
        resetServiceData();
        toast.success('Tilsyn gemt');
        queryClient.invalidateQueries(['service', ts_id]);
      },
      onError: (error) => {
        if (error.response.data.detail.includes('No unit')) {
          toast.error('Der er ingen enhed tilknyttet på denne dato');
        } else {
          toast.error('Der skete en fejl');
        }
      },
    });
  };

  const handleEdit = (data) => {
    data.dato = data.dato.replace(' ', 'T').substr(0, 19);
    setServiceData(data);
  };

  const handleDelete = (gid) => {
    serviceDelete.mutate(gid);
  };

  return (
    <>
      <TilsynForm
        formData={serviceData}
        changeFormData={changeServiceData}
        handleSubmit={handleServiceSubmit}
        cancel={() => {
          resetServiceData();
          setFormToShow(null);
        }}
      />
      <TilsynTable
        services={services}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        canEdit={canEdit}
      />
    </>
  );
};

export default TilsynPage;
