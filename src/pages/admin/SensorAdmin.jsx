import React from 'react';
import {Route, Routes} from 'react-router-dom';

import UserAdmin from '~/pages/admin/brugerstyring/UserAdmin';
import ConfigurationPage from '~/pages/admin/konfiguration/ConfigurationPage';
import NotificationPage from '~/pages/admin/notifikationer/NotificationPage';

import QualityAssurance from './kvalitetssikring/QualityAssurance';
import QualityAssuranceOverview from './kvalitetssikring/QualityAssuranceOverview';
import AdminChooser from './overview/AdminChooser';

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
      </Routes>
    </>
  );
};

export default SensorAdmin;
