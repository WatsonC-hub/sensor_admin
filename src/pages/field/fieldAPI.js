import axios from 'axios';
import {apiClient} from 'src/apiClient';
import {authStore} from 'src/state/store';

let host;
let extEndpoint;
let endpoint;
let userEndpoint;

if (process.env.NODE_ENV === 'developments') {
  // 10.10.158.118
  // 192.168.1.167
  host = 'http://localhost:8080';
  extEndpoint = 'http://localhost:8080/extensions/sensor_app/api';
  // endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc_clone/?q=`;
  userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
} else {
  host = 'https://watsonc.admin.gc2.io';
  extEndpoint = 'https://watsonc.admin.gc2.io/extensions/sensor_app/api';
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
  userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';
}

async function getDTMQuota(x, y) {
  const url = `https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${x} ${y})&username=WXIJZOCTKQ&password=E7WfqcwH_`;
  const {data} = await axios.get(url);
  return data;
}

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], filename, {type: mime});
};

const postImage = async (payload, uri) => {
  const loc_id = payload.loc_id;
  const url = `${extEndpoint}/image/${loc_id}?session_id=${authStore.getState().sessionId}`;
  const file = dataURLtoFile(uri);
  const data = new FormData();
  data.append('files', file, 'tmp');
  data.append('loc_id', payload.loc_id);
  data.append('comment', payload.comment);
  data.append('public', payload.public);
  data.append('date', payload.date);
  const config = {
    headers: {'Content-Type': 'multipart/form-data'},
  };
  const resp = await axios.post(url, data, config);
  return resp;
};

async function deleteImage(loc_id, gid) {
  const url = `${extEndpoint}/image/${loc_id}/${gid}?session_id=${authStore.getState().sessionId}`;
  const resp = await axios.delete(url);
  return resp;
}

const updateImage = async (payload, gid) => {
  const loc_id = payload.loc_id;
  const url = `${extEndpoint}/image/${loc_id}/${gid}?session_id=${authStore.getState().sessionId}`;
  const resp = await axios.put(url, payload);
  return resp;
};

const getCvr = (cvr) => axios.get(`${userEndpoint}/core/org/bycvr/${cvr}`);

const createUser = (payload) => axios.post(`${userEndpoint}calypso/user`, payload);

const resetPassword = (passReset) =>
  axios.post(`${userEndpoint}core/user/forgotpassword`, passReset);

const loginUser = (user, password) => {
  let sessionUrl = `${host}/api/v2/session/start`;
  const loginData = {
    user,
    password,
    schema: null,
  };
  return axios.post(sessionUrl, loginData);
};

const loginAPI = async (username, password) => {
  const data = new FormData();
  data.append('username', username);
  data.append('password', password);

  return await apiClient.post('/auth/login/secure', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export {
  apiClient,
  createUser,
  deleteImage,
  getCvr,
  getDTMQuota,
  loginAPI,
  loginUser,
  postImage,
  resetPassword,
  updateImage,
};
