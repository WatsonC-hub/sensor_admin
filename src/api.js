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
  const url = `${localEndpoint}/sensordata?session_id=${sessionId}`;
  const data = axios.get(url);
  console.log(data);
  return data;
}; //=> getData("getLocations");

const getTableData = (sessionId) => {
  const url = `${localEndpoint}/tabledata?session_id=${sessionId}`;
  return axios.get(url);
}; //getData("getTableData"); //axios.get('data.json');

const getSingleElem = () => getData("getSingleElem");

const getStations = (locid, sessionId) => {
  //const sql = `${testEndpoint}SELECT * from sensor_test.station WHERE locid=${locid}`;
  const url = `${localEndpoint}/station/${locid}/${sessionId}`;
  const data = axios.get(url);
  //console.log(data);
  return data;
};

const getControlData = (stationId) => {
  const sql = `${endpoint}SELECT * FROM sensor.station_pejlinger WHERE stationid=${stationId} ORDER BY timeofmeas`;
  return axios.get(sql);
};

const getGraphData = (stationId) => {
  const sql = `${endpoint}SELECT * FROM sensor.sensordata_view WHERE station=${stationId} ORDER BY timeofmeas DESC`;
  return axios.get(sql);
};

const insertMeasurement = (stationId, formData) => {
  const sql = `${testEndpoint}INSERT INTO sensor_test.waterlevel (stationid,timeofmeas,disttowatertable_m,useforcorrection,comment)
                      VALUES(${stationId},'${formData.timeofmeas}',${formData.disttowatertable_m},${formData.useforcorrection},'${formData.comment}')${apiKey}
  `;
  return axios.get(sql);
};

const updateMeasurement = (stationId, formData) => {
  const columns = Object.keys(formData);
  const gid = formData.gid;
  const updateString = columns
    .filter((k) => k !== "gid" || k !== "stationid")
    .map((k) => {
      if (k === "timeofmeas") return `${k}='${formData[k].split("+")[0]}'`;
      return `${k}='${formData[k]}'`;
    })
    .join(",");

  const sql = `${testEndpoint}UPDATE sensor_test.waterlevel SET ${updateString} WHERE gid = ${gid}${apiKey}`;
  return axios.get(sql);
};

const deleteMeasurement = (gid) => {
  if (!gid) return;
  const sql = `${testEndpoint}DELETE FROM sensor_test.waterlevel WHERE gid=${gid}${apiKey}`;
  return axios.get(sql);
};

const getMeasurements = (stationId, sessionId) => {
  const sql = `${testEndpoint}SELECT * FROM sensor_test.waterlevel WHERE stationid=${stationId} ORDER BY timeofmeas DESC`;
  const url = `${localEndpoint}/station/measurements/${stationId}?session_id=${sessionId}`;
  return axios.get(url);
};

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
};
