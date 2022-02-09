import axios from "axios";
import { queries, testQueries } from "./config";

let host;
let extEndpoint;
let endpoint;
let userEndpoint;

if (process.env.NODE_ENV === "development") {
  host = "http://localhost:8080";
  extEndpoint = "http://localhost:8080/extensions/sensor_app/api";
  // endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc_clone/?q=`;
  userEndpoint = "https://backend.calypso.watsonc.dk/rest/";
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
} else {
  host = "https://watsonc.admin.gc2.io";
  extEndpoint = "https://watsonc.admin.gc2.io/extensions/sensor_app/api";
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
  userEndpoint = "https://backend.calypso.watsonc.dk/rest/";
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

const getSensorData = (sessionId) => {
  const url = `${extEndpoint}/sensordata?session_id=${sessionId}`;
  const data = axios.get(url);
  return data;
};

const getStamData = () => {
  const url = `${extEndpoint}/stamdata`;
  return axios.get(url);
};

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], filename, { type: mime });
};

const postImage = (loc_id, uri) => {
  const url = `${extEndpoint}/image/${loc_id}`;
  const file = dataURLtoFile(uri);
  const data = new FormData();
  data.append("img", file, "tmp");
  const config = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  return axios.post(url, data, config);
};

const getTableData = (sessionId) => {
  const url = `${extEndpoint}/tabledata?session_id=${sessionId}`;
  return axios.get(url);
};

// const getSingleElem = () => getData("getSingleElem");

const getStations = (locid, sessionId) => {
  const url = `${extEndpoint}/station/${locid}?session_id=${sessionId}`;
  const data = axios.get(url);
  return data;
};

const getLocidFromLabel = (labelId) => {
  const sql = `${endpoint}SELECT loc_id, ts_id FROM sensor.qrid_to_ts_id where calypso_id =${labelId}`;
  return axios.get(sql);
};

const getControlData = (stationId) => {
  const sql = `${endpoint}SELECT * FROM sensor.station_pejlinger WHERE stationid=${stationId} ORDER BY timeofmeas`;
  return axios.get(sql);
};

const getGraphData = (stationId) => {
  const sql = `${endpoint}SELECT * FROM calypso_stationer.sensordata_station_json WHERE ts_id=${stationId}`;
  return axios.get(sql);
};

const insertMeasurement = (sessionId, stationId, formData) => {
  formData["timeofmeas"] = formData["timeofmeas"].split("+")[0];
  formData["stationid"] = stationId;
  const url = `${extEndpoint}/station/measurements/${stationId}?session_id=${sessionId}`;
  return axios.post(url, formData);
};

const updateMeasurement = (sessionId, stationId, formData) => {
  const gid = formData["gid"];
  formData["timeofmeas"] = formData["timeofmeas"].split("+")[0];
  const url = `${extEndpoint}/station/measurements/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.put(url, formData);
};

const insertMp = (sessionId, stationId, formData) => {
  formData["startdate"] = formData["startdate"].split("+")[0];
  formData["enddate"] = formData["enddate"].split("+")[0];
  formData["stationid"] = stationId;
  const url = `${extEndpoint}/station/watlevmp/${stationId}?session_id=${sessionId}`;
  return axios.post(url, formData);
};

const updateMp = (sessionId, stationId, formData) => {
  const gid = formData["gid"];
  formData["startdate"] = formData["startdate"].split("+")[0];
  formData["enddate"] = formData["enddate"].split("+")[0];
  const url = `${extEndpoint}/station/watlevmp/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.put(url, formData);
};

const deleteMP = (sessionId, stationId, gid) => {
  if (!gid) return;
  const url = `${extEndpoint}/station/watlevmp/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.delete(url);
};

const deleteMeasurement = (sessionId, stationId, gid) => {
  if (!gid) return;
  const url = `${extEndpoint}/station/measurements/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.delete(url);
};

const getMeasurements = (stationId, sessionId) => {
  const url = `${extEndpoint}/station/measurements/${stationId}?session_id=${sessionId}`;
  return axios.get(url);
};

const getMP = (stationId, sessionId) => {
  const url = `${extEndpoint}/station/watlevmp/${stationId}?session_id=${sessionId}`;
  return axios.get(url);
};

const getService = (stationId) => {
  const url = `${extEndpoint}/station/service/${stationId}`;
  return axios.get(url);
};

const updateService = (sessionId, stationId, formData) => {
  const gid = formData["gid"];
  formData["dato"] = formData["dato"].split("+")[0];
  const url = `${extEndpoint}/station/service/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.put(url, formData);
};

const insertService = (sessionId, stationId, formData) => {
  formData["dato"] = formData["dato"].split("+")[0];
  // formData["terminal_id"] = terminalId;
  const url = `${extEndpoint}/station/service/${stationId}?session_id=${sessionId}`;
  return axios.post(url, formData);
};

const deleteService = (sessionId, stationId, gid) => {
  if (!gid) return;
  const url = `${extEndpoint}/station/service/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.delete(url);
};

const getStationTypes = () =>
  axios.get(
    `${endpoint}SELECT tstype_id, tstype_name FROM sensor.timeseries_type`
  );

const getLocationTypes = () =>
  axios.get(`${endpoint}SELECT loctype_id, loctypename FROM sensor.loctype2`);

const getAvailableUnits = (sessionId) =>
  axios.get(`${extEndpoint}/stamdata/units?session_id=${sessionId}`);

const postStamdata = (data) => axios.post(`${extEndpoint}/stamdata`, data);

const updateStamdata = (data, sessionId) =>
  axios.put(`${extEndpoint}/stamdata?session_id=${sessionId}`, data);

const getStamdataByStation = (stationId) =>
  axios.get(`${extEndpoint}/stamdata/station/${stationId}`);

const getUnitHistory = (stationId) =>
  axios.get(`${extEndpoint}/stamdata/unithistory/${stationId}`);

const getCvr = (cvr) => axios.get(`${userEndpoint}/core/org/bycvr/${cvr}`);

const createUser = (payload) =>
  axios.post(`${userEndpoint}/calypso/user`, payload);

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

const takeHomeEquipment = (gid, data, sessionId) => {
  const url = `${extEndpoint}/stamdata/unithistory/${gid}?session_id=${sessionId}`;
  return axios.put(url, data);
};

const getDTMQuota = (x, y) => {
  const url = `https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter?geop=POINT(${x} ${y})&username=WXIJZOCTKQ&password=E7WfqcwH_`;
  return axios.get(url);
};

export {
  getSensorData,
  getTableData,
  // getSingleElem,
  getStations,
  getMeasurements,
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  insertMp,
  updateMp,
  getControlData,
  getGraphData,
  getLocidFromLabel,
  getStamData,
  getStationTypes,
  getAvailableUnits,
  postStamdata,
  getStamdataByStation,
  getUnitHistory,
  getCvr,
  createUser,
  loginUser,
  resetPassword,
  getMP,
  deleteMP,
  takeHomeEquipment,
  updateStamdata,
  getLocationTypes,
  getDTMQuota,
  getService,
  updateService,
  insertService,
  deleteService,
  postImage,
};
