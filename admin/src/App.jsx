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

function App() {
  const { aToken } = useContext(AdminContext);

  console.log(aToken)

  return (
    <div className="bg-[#f8f9fd]">
      <ToastContainer />
      {aToken && <Navbar /> }
      <div className={aToken ? 'flex items-start' : ''}> 
        {aToken && <Sidebar />}
        <Routes>
          <Route path="/" element={aToken ?<Dashboard/> : <Login/>} />
          <Route path="/admin-dashboard" element={<Dashboard/>} />
          <Route path="/all-appointments" element={<AllAppointments/>} />
          <Route path="/add-doctor" element={<AddDoctor/>} />
          <Route path="/doctor-list" element={<DoctorsList/>} />
          <Route path="/login" element={aToken ? <Dashboard/>: <Login/>} />

        </Routes>
      </div>
    </div>
  )
}

export default App;
