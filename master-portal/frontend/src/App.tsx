import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MasterDashboard from "./pages/master/MasterDashboard";
import MasterLogin from "./pages/master/MasterLogin";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/master/login" element={<MasterLogin />} />
        <Route path="/master/dashboard" element={<MasterDashboard />} />
        <Route path="*" element={<Navigate to="/master/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;