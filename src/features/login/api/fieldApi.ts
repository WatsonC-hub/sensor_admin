import axios from 'axios';

import {apiClient} from '~/apiClient';

const userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';

async function getDTMQuota(x: number, y: number) {
  const url = `https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${x} ${y})&username=WXIJZOCTKQ&password=E7WfqcwH_`;
  const {data} = await axios.get(url);
  return data;
}

const getCvr = (cvr: number) => axios.get(`${userEndpoint}/core/org/bycvr/${cvr}`);

const createUser = (payload: object) => axios.post(`${userEndpoint}calypso/user`, payload);

const resetPassword = (passReset: string) =>
  axios.post(`${userEndpoint}core/user/forgotpassword`, passReset);

const loginAPI = async (username: string, password: string) => {
  const data = new FormData();
  data.append('username', username);
  data.append('password', password);

  return await apiClient.post('/auth/login/secure', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export {apiClient, createUser, getCvr, getDTMQuota, loginAPI, resetPassword};
