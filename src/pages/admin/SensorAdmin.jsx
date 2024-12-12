import React from 'react';
import {Route, Routes} from 'react-router-dom';

import UserAdmin from '~/pages/admin/brugerstyring/UserAdmin';
import ConfigurationPage from '~/pages/admin/konfiguration/ConfigurationPage';
import QualityAssurance from '~/pages/admin/kvalitetssikring/QualityAssurance';
import QualityAssuranceOverview from '~/pages/admin/kvalitetssikring/QualityAssuranceOverview';
import NotificationPage from '~/pages/admin/notifikationer/NotificationPage';
import AdminChooser from '~/pages/admin/overview/AdminChooser';

import TasksPage from './opgaver/TasksPage';
import Trip from './opgaver/Trip';

const SensorAdmin = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminChooser />} />
        <Route path="/kvalitetssikring" element={<QualityAssuranceOverview />} />
        <Route path="/kvalitetssikring/:ts_id" element={<QualityAssurance />} />
        <Route path="/notifikationer" element={<NotificationPage />} />
        <Route path="/brugerstyring" element={<UserAdmin />} />
        <Route path="/konfiguration" element={<ConfigurationPage />} />
        <Route path="/opgaver" element={<TasksPage />} />
        <Route path="/opgaver/tur" element={<Trip />} />
        <Route path="*" element={<AdminChooser />} />
      </Routes>
    </>
  );
};

export default SensorAdmin;
