import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import MonitoringPoints from "@/pages/MonitoringPoints";
import RealtimeData from "@/pages/RealtimeData";
import DoseTrend from "@/pages/DoseTrend";
import Alerts from "@/pages/Alerts";
import Emergency from "@/pages/Emergency";
import Calibration from "@/pages/Calibration";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring-points" element={<MonitoringPoints />} />
          <Route path="/realtime-data" element={<RealtimeData />} />
          <Route path="/dose-trend" element={<DoseTrend />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}
