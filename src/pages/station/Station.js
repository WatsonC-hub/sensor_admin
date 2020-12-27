import React from 'react';
import HistoricMeasurements from './HistoricMeasurements';
import BearingGraph from './BearingGraph';
import ActionArea from './ActionArea';

export default function Station(){
    return (
        <>
        <BearingGraph />
        <HistoricMeasurements />
        <ActionArea />
        </>
    );
}