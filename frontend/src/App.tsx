import React from 'react';
import { AppProvider, useApp } from './store/appStore';
import LoginPage from './pages/LoginPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ControlRoomPage from './pages/ControlRoomPage';
import TrafficRiskPage from './pages/TrafficRiskPage';
import DeploymentPage from './pages/DeploymentPage';
import IncidentsPage from './pages/IncidentsPage';
import OfficersPage from './pages/OfficersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CitizenReportsPage from './pages/CitizenReportsPage';

function AppContent() {
  const { state } = useApp();

  if (!state.isLoggedIn) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (state.currentView) {
      case 'control-room':    return <ControlRoomPage />;
      case 'traffic-risk':   return <TrafficRiskPage />;
      case 'deployment':     return <DeploymentPage />;
      case 'incidents':      return <IncidentsPage />;
      case 'officers':       return <OfficersPage />;
      case 'analytics':      return <AnalyticsPage />;
      case 'citizen-reports':return <CitizenReportsPage />;
      default:               return <ControlRoomPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-slate-100">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
