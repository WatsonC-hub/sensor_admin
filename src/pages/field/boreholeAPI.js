import axios from 'axios';

let host;
let extEndpoint;
let endpoint;
let userEndpoint;
let jupiterEndpoint;
let searchEndpoint;

if (process.env.NODE_ENV === 'development') {
  host = 'http://localhost:8080';
  extEndpoint = 'http://localhost:8080/extensions/sensor_app/api';
  // endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc_clone/?q=`;
  userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
  jupiterEndpoint = `https://watsonc.admin.gc2.io/api/v2/sql/jupiter/?q=`;
  searchEndpoint = `https://watsonc.admin.gc2.io/api/v2/elasticsearch/search/jupiter/chemicals/boreholes_time_series_without_chemicals_view`;
} else {
  host = 'https://watsonc.admin.gc2.io';
  extEndpoint = 'https://watsonc.admin.gc2.io/extensions/sensor_app/api';
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
  userEndpoint = 'https://backend.calypso.watsonc.dk/rest/';
  jupiterEndpoint = `https://watsonc.admin.gc2.io/api/v2/sql/jupiter/?q=`;
  searchEndpoint = `https://watsonc.admin.gc2.io/api/v2/elasticsearch/search/jupiter/chemicals/boreholes_time_series_without_chemicals_view`;
}

// const locHost = "http://localhost:8080";
// const remoteHost = "https://watsonc.admin.gc2.io";
// const endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
// const testEndpoint = `https://watsonc.admin.gc2.io/api/v2/sql/magloire@watsonc?q=`;
// const apiKey = "&key=2a528b3bc396ca7f544b7b6a4bc52bb7";
// const localEndpoint = "http://localhost:8080/extensions/sensor_app/api";
// const remoteEndpoint =
//   "https://watsonc-test.admin.gc2.io/extensions/sensor_app/api";

// const getData = (key) => axios.get(`${testEndpoint}${queries[key]}`);

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

const postImage = (payload, uri, sessionId) => {
  const boreholeno = payload.boreholeno;
  console.log(payload);
  const url = `${extEndpoint}/borehole/image/${boreholeno}?session_id=${sessionId}`;
  const file = dataURLtoFile(uri);
  const data = new FormData();
  data.append('files', file, 'tmp');
  data.append('boreholeno', payload.boreholeno);
  data.append('comment', payload.comment);
  data.append('public', payload.public);
  data.append('date', payload.date);
  const config = {
    headers: {'Content-Type': 'multipart/form-data'},
  };
  return axios.post(url, data, config);
};

const deleteImage = (boreholeno, gid, sessionId) => {
  const url = `${extEndpoint}/borehole/image/${boreholeno}/${gid}?session_id=${sessionId}`;
  return axios.delete(url);
};

const updateImage = (payload, gid, sessionId) => {
  const boreholeno = payload.boreholeno;
  const url = `${jupiterEndpoint}/borehole/image/${boreholeno}/${gid}?session_id=${sessionId}`;
  return axios.put(url, payload);
};

const getImage = boreholeno => {
  const url = `${extEndpoint}/borehole/image/${boreholeno}`;
  return axios.get(url);
};

const postElasticSearch = search => {
  return axios.post(`${searchEndpoint}`, search);
};

const getBoreholes = sessionId => {
  const url = `${extEndpoint}/borehole/boreholes?session_id=${sessionId}`;
  return axios.get(url);
};

const getBorehole = boreholeno => {
  const url = `${jupiterEndpoint}SELECT boreholeno, intakeno, json_agg(DISTINCT intakeno) as intakenos, latitude, longitude
                FROM grundvandspejling.borehole_data WHERE boreholeno = '${boreholeno}'
                GROUP BY boreholeno, intakeno, latitude, longitude;`;
  const data = axios.get(url);
  return data;
};

const getOurWaterlevel = (boreholeno, intakeno, sessionId) => {
  const url = `${extEndpoint}/borehole/measurements/${boreholeno}/${intakeno}?session_id=${sessionId}`;
  return axios.get(url);
};

const getLastMeasurement = (boreholeno, intakeno) => {
  const url = `${jupiterEndpoint}SELECT disttowatertable_m, timeofmeas FROM grundvandspejling.waterlevel 
                WHERE boreholeno = '${boreholeno}' AND intakeno = '${intakeno}' ORDER BY timeofmeas DESC LIMIT 1`;
  return axios.get(url);
};

const getJupiterWaterlevel = (boreholeno, intakeno) => {
  const url = `${jupiterEndpoint}SELECT * FROM grundvandspejling.borehole_waterlevel WHERE boreholeno = '${boreholeno}'  AND intakeno = ${intakeno}`;
  return axios.get(url);
};

const getBoreholeMP = (boreholeno, intakeno, sessionId) => {
  const url = `${extEndpoint}/borehole/watlevmp/${boreholeno}/${intakeno}?session_id=${sessionId}`;
  return axios.get(url);
};

const insertMeasurement = (sessionId, boreholeno, intakeno, formData) => {
  formData['timeofmeas'] = formData['timeofmeas'].split('+')[0];
  formData['boreholeno'] = boreholeno;
  formData['intakeno'] = intakeno;
  const url = `${extEndpoint}/borehole/measurements/${boreholeno}/${intakeno}?session_id=${sessionId}`;
  return axios.post(url, formData);
};

const updateMeasurement = (sessionId, boreholeno, intakeno, formData) => {
  const gid = formData['gid'];
  formData['timeofmeas'] = formData['timeofmeas'].split('+')[0];
  const url = `${extEndpoint}/borehole/measurements/${boreholeno}/${intakeno}/${gid}?session_id=${sessionId}`;
  return axios.put(url, formData);
};

const insertMp = (sessionId, boreholeno, intakeno, formData) => {
  formData['startdate'] = formData['startdate'].split('+')[0];
  formData['enddate'] = formData['enddate'].split('+')[0];
  formData['boreholeno'] = boreholeno;
  formData['intakeno'] = intakeno;
  const url = `${extEndpoint}/borehole/watlevmp/${boreholeno}/${intakeno}?session_id=${sessionId}`;
  return axios.post(url, formData);
};

const updateMp = (sessionId, boreholeno, intakeno, formData) => {
  const gid = formData['gid'];
  formData['startdate'] = formData['startdate'].split('+')[0];
  formData['enddate'] = formData['enddate'].split('+')[0];
  const url = `${extEndpoint}/borehole/watlevmp/${boreholeno}/${intakeno}/${gid}?session_id=${sessionId}`;
  return axios.put(url, formData);
};

const deleteMP = (sessionId, boreholeno, intakeno, gid) => {
  if (!gid) return;
  const url = `${extEndpoint}/borehole/watlevmp/${boreholeno}/${intakeno}/${gid}?session_id=${sessionId}`;
  return axios.delete(url);
};

const deleteMeasurement = (sessionId, boreholeno, intakeno, gid) => {
  if (!gid) return;
  const url = `${extEndpoint}/borehole/measurements/${boreholeno}/${intakeno}/${gid}?session_id=${sessionId}`;
  return axios.delete(url);
};

const getCvr = cvr => axios.get(`${userEndpoint}/core/org/bycvr/${cvr}`);

const createUser = payload => axios.post(`${userEndpoint}/calypso/user`, payload);

const resetPassword = passReset => axios.post(`${userEndpoint}core/user/forgotpassword`, passReset);

const loginUser = (user, password) => {
  let sessionUrl = `${host}/api/v2/session/start`;
  const loginData = {
    user,
    password,
    schema: null,
  };
  return axios.post(sessionUrl, loginData);
};

export {
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  insertMp,
  updateMp,
  getCvr,
  createUser,
  loginUser,
  resetPassword,
  deleteMP,
  getBoreholes,
  getBorehole,
  postElasticSearch,
  getOurWaterlevel,
  getBoreholeMP,
  getJupiterWaterlevel,
  getImage,
  deleteImage,
  updateImage,
  dataURLtoFile,
  postImage,
  getLastMeasurement,
};
