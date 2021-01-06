import axios from "axios";
import { queries, testQueries } from "./config";

const sqlQuery = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;
const testSqlQuery = `https://watsonc.admin.gc2.io/api/v2/sql/magloire@watsonc?q=`;

const getData = (key) => axios.get(`${sqlQuery}${queries[key]}`);

const getSensorData = () => getData("getLocations");

const getTableData = () => getData("getTableData"); //axios.get('data.json');

const getSingleElem = () => getData("getSingleElem");

const getStations = (locid) => {
  const sql = `${testSqlQuery}SELECT * from sensor_test.station WHERE locid=${locid}`;
  return axios.get(sql);
};

const getMeasurements = (stationId) => {
  const sql = `${testSqlQuery}SELECT * FROM sensor_test.waterlevel WHERE stationid=${stationId} ORDER BY timeofmeas DESC`;
  return axios.get(sql);
};

export {
  getSensorData,
  getTableData,
  getSingleElem,
  getStations,
  getMeasurements,
};
