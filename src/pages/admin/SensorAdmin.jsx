import React from 'react';
import {Route, Routes} from 'react-router-dom';
import UserAdmin from 'src/pages/admin/Brugerstyring/UserAdmin';
import ConfigurationPage from 'src/pages/admin/Konfiguration/ConfigurationPage';
import NotificationPage from 'src/pages/admin/Notifikationer/NotificationPage';
import QualityAssurance from './Kvalitetssikring/QualityAssurance';
import QualityAssuranceOverview from './Kvalitetssikring/QualityAssuranceOverview';
import AdminChooser from './Overview/AdminChooser';

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
