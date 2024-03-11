/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimeseriesResponseInLocation } from './TimeseriesResponseInLocation';
export type LocationWithTimeseries = {
    loc_id?: number;
    loc_name: string;
    x: number;
    y: number;
    terrainlevel?: number;
    mainloc?: string;
    subloc?: string;
    description?: string;
    loctypename: string;
    timeseries?: Array<TimeseriesResponseInLocation>;
};

