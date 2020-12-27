import axios from 'axios';
import {queries} from './config';

const sqlQuery = `https://watsonc.admin.gc2.io/api/v2/sql/watsonc/?q=`;

const getData = (key) => axios.get(`${sqlQuery}${queries[key]}`);

const getSensorData = () => getData('getSensorLocation');

const getTableData = () => axios.get('data.json');//getData('getTableData');

const getSingleElem = () => getData('getSingleElem');

export {
    getSensorData,
    getTableData,
    getSingleElem
}