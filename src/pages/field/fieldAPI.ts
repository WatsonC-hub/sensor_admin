import axios from 'axios';

import {apiClient} from '~/apiClient';

async function getDTMQuota(x: number, y: number) {
  const url = `https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${x} ${y})&username=WXIJZOCTKQ&password=E7WfqcwH_`;
  const {data} = await axios.get(url);
  return data;
}

const resetPassword = async (body: {email: string}) => {
  const currentUrl = window.location.href;
  const {data} = await apiClient.post(
    `/admin/auth/forgot-password?redirect=${encodeURIComponent(currentUrl)}`,
    body
  );
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

export {getDTMQuota, loginAPI, resetPassword};
