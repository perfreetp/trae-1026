import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Tasks from './pages/Tasks';
import Defects from './pages/Defects';
import Devices from './pages/Devices';
import SpareParts from './pages/SpareParts';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plans" element={<Plans />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="defects" element={<Defects />} />
          <Route path="devices" element={<Devices />} />
          <Route path="spare-parts" element={<SpareParts />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
