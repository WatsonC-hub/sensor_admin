import React from 'react';
import {Route, Routes} from 'react-router-dom';

import QualityAssurance from '~/pages/admin/kvalitetssikring/QualityAssurance';
import QualityAssuranceOverview from '~/pages/admin/kvalitetssikring/QualityAssuranceOverview';
import AdminChooser from '~/pages/admin/overview/AdminChooser';

const SensorAdmin = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminChooser />} />
        <Route path="/kvalitetssikring" element={<QualityAssuranceOverview />} />
        <Route path="/kvalitetssikring/:ts_id" element={<QualityAssurance />} />
      </Routes>
    </>
  );
};

export default SensorAdmin;
