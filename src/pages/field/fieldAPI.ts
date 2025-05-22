import axios from 'axios';

import {apiClient} from '~/apiClient';

const userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';

async function getDTMQuota(x: number, y: number) {
  const url = `https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${x} ${y})&username=WXIJZOCTKQ&password=E7WfqcwH_`;
  const {data} = await axios.get(url);
  return data;
}

const getCvr = (cvr: string) => axios.get(`${userEndpoint}/core/org/bycvr/${cvr}`);

type Aux = {
  calypso: {
    mail: boolean;
    acceptterms: boolean;
    license: string;
  };
};

type createUserPayload = {
  aux: Aux;
  email: string;
  firstName: string;
  lastName: string;
  id: number;
  org: string;
  userName: string;
};

const createUser = (payload: createUserPayload) =>
  axios.post(`${userEndpoint}calypso/user`, payload);

const resetPassword = async (body: {email: string}) => {
  const currentUrl = window.location.href;
  const {data} = await apiClient.post(`/admin/forgot-password?redirect=${currentUrl}`, body);
  return data;
};

const loginAPI = async (inputdata: {username: string; password: string}) => {
  const formData = new FormData();
  formData.append('username', inputdata.username);
  formData.append('password', inputdata.password);

  const {data} = await apiClient.post('/auth/login/secure', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return data;
};

export {createUser, getCvr, getDTMQuota, loginAPI, resetPassword};
