import axios from 'axios';

import {apiClient} from '~/apiClient';

const userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';

async function getDTMQuota(x, y) {
  const url = `https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${x} ${y})&username=WXIJZOCTKQ&password=E7WfqcwH_`;
  const {data} = await axios.get(url);
  return data;
}

const getCvr = (cvr) => axios.get(`${userEndpoint}/core/org/bycvr/${cvr}`);

const createUser = (payload) => axios.post(`${userEndpoint}calypso/user`, payload);

const resetPassword = (passReset) =>
  axios.post(`${userEndpoint}core/user/forgotpassword`, passReset);

const loginAPI = async (inputdata) => {
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

export {apiClient, createUser, getCvr, getDTMQuota, loginAPI, resetPassword};
