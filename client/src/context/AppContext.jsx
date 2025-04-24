import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currencySymbol = "$"
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token')? localStorage.getItem('token') : '');
    const [userData, setUserData] = useState(false);
    const [userMedicalRecords, setUserMedicalRecords] = useState([]);


    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    
      const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split("_");
        const day = dateArray[0].trim();
        const monthIndex = Number(dateArray[1].trim()) - 1;
        const year = dateArray[2].trim();
    
        if (monthIndex < 0 || monthIndex >= months.length) {
          return "Invalid Month";
        }
    
        return `${day} ${months[monthIndex]} ${year}`;
      };
    
    const getDoctorsData = async () => {

        try {
            
            const {data} = await axios.get(backendUrl+'/api/doctor/list');

           
            if(data.success){
                setDoctors(data.doctors);
                console.log("doctors", doctors)
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl+'/api/user/get-profile',{headers:{token}});
            if(data.success){
                setUserData(data.userData);
            } else {
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getMedicalRecordsByUser = async (userId) => {
        if (!userId) {
            toast.error("User ID is required to fetch medical records.");
            return;
        }
    
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/user-medical-records/${userId}`,
                { headers: { token } }
            );
    
            if (data.success) {
                setUserMedicalRecords(data.records);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error fetching user medical records:", error);
            toast.error("Failed to load medical records.");
        }
    };
    

    const value = {
        doctors, getDoctorsData,
        currencySymbol,
        token,setToken,
        backendUrl,
        userData,setUserData,
        loadUserProfileData,
        userMedicalRecords, setUserMedicalRecords,getMedicalRecordsByUser,
        slotDateFormat
    }


    useEffect(() => {
        console.log("doctors", doctors)
        getDoctorsData();
    },[])

    useEffect(() => {
        if(token){
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    },[token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
 
export default AppContextProvider