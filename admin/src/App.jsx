import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import Navbar from "./components/Navbar";
import { AdminContext } from "./context/AdminContext";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import { DoctorContext } from "./context/DoctorContext";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

function App() {
  const { aToken } = useContext(AdminContext);

  const { dToken } = useContext(DoctorContext);

  return (
    <div className="bg-[#f8f9fd]">
      <ToastContainer />
      {aToken || dToken && <Navbar /> }
      <div className={(aToken || dToken) ? 'flex items-start' : ''}> 
        {aToken || dToken && <Sidebar />}
        <Routes>
          <Route path="/" element={aToken ?<Dashboard/> : <Login/>} />
          <Route path="/admin-dashboard" element={<Dashboard/>} />
          <Route path="/all-appointments" element={<AllAppointments/>} />
          <Route path="/add-doctor" element={<AddDoctor/>} />
          <Route path="/doctor-list" element={<DoctorsList/>} />
          <Route path="/login" element={aToken ? <Dashboard/>: <Login/>} />

          <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
          <Route path='/doctor-appointments' element={<DoctorAppointments/>} />
          <Route path='/doctor-profile' element={<DoctorProfile/>} />

        </Routes>
      </div>
    </div>
  )
}

export default App;
