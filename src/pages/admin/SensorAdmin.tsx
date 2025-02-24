import React from 'react';
import {Route, Routes} from 'react-router-dom';

import QualityAssurance from '~/pages/admin/kvalitetssikring/QualityAssurance';
import QualityAssuranceOverview from '~/pages/admin/kvalitetssikring/QualityAssuranceOverview';
import AdminChooser from '~/pages/admin/overview/AdminChooser';
import AdminRouterProvider from '~/state/AdminRouterProvider';

import TasksPage from './opgaver/TasksPage';
import Trip from './opgaver/Trip';

const SensorAdmin = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminChooser />} />
        <Route
          path="/kvalitetssikring"
          element={
            <AdminRouterProvider>
              <QualityAssuranceOverview />
            </AdminRouterProvider>
          }
        />
        <Route
          path="/kvalitetssikring/:ts_id"
          element={
            <AdminRouterProvider>
              <QualityAssurance />
            </AdminRouterProvider>
          }
        />
        <Route path="/opgaver" element={<TasksPage />} />
        <Route path="/opgaver/tur" element={<Trip />} />
        <Route path="/opgaver/tur/:trip_id" element={<Trip />} />
      </Routes>
    </>
  );
};

export default SensorAdmin;
