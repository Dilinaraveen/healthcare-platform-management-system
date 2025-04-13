import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backendUrl, token } = useContext(AppContext);

  useEffect(() => {
    // Get the appointment ID from URL parameters
    const query = new URLSearchParams(location.search);
    const appointmentId = query.get('appointment_id');
    
    if (appointmentId) {
      // Verify and update payment status
      const verifyPayment = async () => {
        try {
          console.log("Verifying payment for appointment:", appointmentId);
          
          const { data } = await axios.post(
            backendUrl + "/api/user/verify-payment",
            { appointmentId },
            { headers: { token } }
          );
          
          if (data.success) {
            toast.success("Payment successful!");
          } else {
            toast.error(data.message || "Payment verification failed");
          }
        } catch (error) {
          console.log("Error in payment verification:", error);
          toast.error(error.message || "Payment verification failed");
        } 
      };
      
      verifyPayment();
    } else {
      // No appointment ID found, redirect back to appointments
      setTimeout(() => {
        navigate("/my-appointments", { replace: true });
      }, 3000);
    }
  }, [location, backendUrl, token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-green-50 p-8 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 text-primary mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <h2 className="text-2xl font-bold text-primary mb-4">
          Payment Successful!
        </h2>
        <p className="text-xl text-gray-700 ">
          Your appointment has been confirmed and payment has been processed.
        </p>
        <p className="text-gray-500">
          You will be redirected to your appointments page or click here to return to home page.
        </p>
        <button
          className="mt-4 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark"
          onClick={() => navigate("/my-appointments")}
        > My Appointments</button>
      </div>
    </div>
  );
};

export default PaymentSuccess;