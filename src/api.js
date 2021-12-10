import axios from "axios";
import { queries, testQueries } from "./config";

let host;
let extEndpoint;
let endpoint;

if (process.env.NODE_ENV === "development") {
  host = "http://localhost:8080";
  extEndpoint = "http://localhost:8080/extensions/sensor_app/api";
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc_clone/?q=`;
} else {
  host = "https://watsonc.admin.gc2.io";
  extEndpoint = "https://watsonc.admin.gc2.io/extensions/sensor_app/api";
  endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
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

const getTableData = (sessionId) => {
  const url = `${extEndpoint}/tabledata?session_id=${sessionId}`;
  return axios.get(url);
};

// const getSingleElem = () => getData("getSingleElem");

const getStations = (locid, sessionId) => {
  const url = `${extEndpoint}/station/${locid}/${sessionId}`;
  const data = axios.get(url);
  return data;
};

const getLocidFromLabel = (labelId) => {
  const sql = `${endpoint}SELECT loc_id FROM sensor.qrid_to_stationid where calypso_id =${labelId}`;
  return axios.get(sql);
};

const getControlData = (stationId) => {
  const sql = `${endpoint}SELECT * FROM sensor.station_pejlinger WHERE stationid=${stationId} ORDER BY timeofmeas`;
  return axios.get(sql);
};

const getGraphData = (stationId) => {
  const sql = `${endpoint}SELECT * FROM sensor.sensordata_view WHERE station=${stationId} ORDER BY timeofmeas DESC`;
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

const getStationTypes = () =>
  axios.get(
    `${endpoint}SELECT tstype_id, tstype_name FROM sensor.timeseries_type`
  );

const getAvailableUnits = () =>
  axios.get(`${extEndpoint}/stamdata/units`).then((res) => res.data.data);

const postStamdata = (data) => axios.post(`${extEndpoint}/stamdata`, data);

const getStamdataByStation = (stationId) =>
  axios.get(`${extEndpoint}/stamdata/station/${stationId}`);

const getUnitHistory = (stationId) =>
  axios.get(`${extEndpoint}/stamdata/unithistory/${stationId}`);

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
  loginUser,
  getMP,
  deleteMP,
};
