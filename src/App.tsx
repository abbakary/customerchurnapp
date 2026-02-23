import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PredictForm from './components/PredictForm';
import BatchPredict from './components/BatchPredict';
import HistoryPage from './components/HistoryPage';
import CustomerTracking from './components/CustomerTracking';
import CustomerDetail from './components/CustomerDetail';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<PredictForm />} />
          <Route path="/batch" element={<BatchPredict />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/tracking" element={<CustomerTracking />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer className="footer">
        Customer-Churn AI · Premium Enterprise Analytics · Powered by Digital-Innovation
      </footer>
    </BrowserRouter>
  );
}
