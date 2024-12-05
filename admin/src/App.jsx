import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import Navbar from "./components/Navbar";
import { AdminContext } from "./context/AdminContext";
import Sidebar from "./components/Sidebar";

function App() {
  const { aToken } = useContext(AdminContext);

  console.log(aToken)

  return aToken ? (
    <div className="bg-[f8f9fd]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start"> 
        <Sidebar />
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App;
