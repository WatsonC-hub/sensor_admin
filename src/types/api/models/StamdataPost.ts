/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__sensor_field__stamdata__models__WatlevmpPost } from './app__sensor_field__stamdata__models__WatlevmpPost';
import type { LocationPost } from './LocationPost';
import type { TimeseriesPost } from './TimeseriesPost';
import type { UnitTsHistoryPost } from './UnitTsHistoryPost';
export type StamdataPost = {
    location: LocationPost;
    timeseries: TimeseriesPost;
    watlevmp?: app__sensor_field__stamdata__models__WatlevmpPost;
    unit: UnitTsHistoryPost;
};

