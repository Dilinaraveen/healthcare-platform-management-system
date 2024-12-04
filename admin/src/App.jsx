import Login from "./pages/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";

function App() {
  const { aToken } = useContext(AppContext);

  return aToken ? (
    <div className="bg-[f8f9fd]">
      <ToastContainer />
      <Navbar />
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App;
