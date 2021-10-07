import axios from "axios";
import { queries, testQueries } from "./config";

const endpoint = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
const testEndpoint = `https://watsonc.admin.gc2.io/api/v2/sql/magloire@watsonc?q=`;
const apiKey = "&key=2a528b3bc396ca7f544b7b6a4bc52bb7";
const localEndpoint = "http://localhost:8080/extensions/sensor_app/api";
const extEndpoint =
  "https://watsonc-test.admin.gc2.io/extensions/sensor_app/api";

const getData = (key) => axios.get(`${testEndpoint}${queries[key]}`);

const getSensorData = (sessionId) => {
  const url = `${extEndpoint}/sensordata?session_id=${sessionId}`;
  const data = axios.get(url);
  return data;
};

const getStamData = () => {
  const url = `${endpoint}SELECT * FROM sensor_test.stamdata_sensorapp`;
  return axios.get(url);
};

const getTableData = (sessionId) => {
  const url = `${extEndpoint}/tabledata?session_id=${sessionId}`;
  return axios.get(url);
};

const getSingleElem = () => getData("getSingleElem");

const getStations = (locid, sessionId) => {
  const url = `${extEndpoint}/station/${locid}/${sessionId}`;
  const data = axios.get(url);
  return data;
};

const getLocidFromLabel = (labelId) => {
  const sql = `${endpoint}SELECT locid FROM sensor.qrid_to_stationid where label_id =${labelId}`;
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
  const url = `${extEndpoint}/station/measurements/${stationId}/10?session_id=${sessionId}`;
  return axios.post(url, formData);
};

const updateMeasurement = (sessionId, stationId, formData) => {
  const gid = formData["gid"];
  formData["timeofmeas"] = formData["timeofmeas"].split("+")[0];
  const url = `${extEndpoint}/station/measurements/${stationId}/${gid}?session_id=${sessionId}`;
  return axios.put(url, formData);
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

const getStationTypes = () =>
  axios.get(
    `${endpoint}SELECT tstype_id, tstype_name FROM sensor.timeseries_type`
  );

export {
  getSensorData,
  getTableData,
  getSingleElem,
  getStations,
  getMeasurements,
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getControlData,
  getGraphData,
  getLocidFromLabel,
  getStamData,
  getStationTypes,
};
