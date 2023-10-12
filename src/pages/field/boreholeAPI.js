import axios from 'axios';
import {authStore} from 'src/state/store';

let host;
let extEndpoint;
let endpoint;
let userEndpoint;
let jupiterEndpoint;
let searchEndpoint;

if (process.env.NODE_ENV === 'development') {
  host = 'https://watsonc.admin.gc2.io';
  extEndpoint = 'https://watsonc.admin.gc2.io/extensions/sensor_app/api';
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

const postImage = (payload, uri) => {
  const boreholeno = payload.boreholeno;
  const url = `${extEndpoint}/borehole/image/${boreholeno}?session_id=${
    authStore.getState().sessionId
  }`;
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

const deleteImage = (boreholeno, gid) => {
  const url = `${extEndpoint}/borehole/image/${boreholeno}/${gid}?session_id=${
    authStore.getState().sessionId
  }`;
  return axios.delete(url);
};

const postElasticSearch = (search) => {
  return axios.post(`${searchEndpoint}`, search);
};

export {dataURLtoFile, deleteImage, postElasticSearch, postImage};
