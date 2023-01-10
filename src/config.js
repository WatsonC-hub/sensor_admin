const config = {
  hostname: 'https://watsonc.admin.gc2.io',
  apiVersion: 'api/v2',
  sqlApi: 'sql/wastonc/?q=',
};

const testConfig = {
  hostname: 'https://watsonc.admin.gc2.io',
  apiVersion: 'api/v2',
  sqlApi: 'sql/magloire@watsonc?q=',
};

const queries = {
  getSensorLocation: 'select%20*%20from%20sensor.active_sensor_locations',
  getLocations: 'select%20*%20from%20sensor_test.active_sensor_locations',
  getTableData:
    'SELECT stationid,stationname,parameter,loc_owner,alarm,locid FROM sensor.sensordata_drift_v2&format=geojson',
  getSingleElem: 'SELECT * from sensor.sensordata_drift_v2 WHERE locid=354',
};

const testQueries = {
  getSensorLocation: 'SELECT * from sensor_test.location&srs=3857',
  getTableData: 'SELECT * from sensor_test.station',
  getSingleElem: 'SELECT * from sensor_test.station WHERE locid=354',
};

export {config, queries, testConfig, testQueries};
