import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import CheckoutForm from "../components/CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";


const stripePromise = loadStripe('pk_test_51QXI4eBMYaMw67Ht23ZmEHlT5vEGh2FbX6EoGMUJVquCsD8jrRaLkx9RFkYG99CrpVgMCJRziLmFPa1wf5vDw5Pr00GddDc0c8')

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [appointments, setAppointments] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);


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

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      console.log("data", data);

      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-stripe",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        setClientSecret(data.clientSecret); // Set clientSecret to trigger checkout form
      } else {
        toast.error(data.message || "Failed to initialize payment.");
      }
    } catch (error) {
      console.error("Payment Error:", error.message);
      toast.error("Error initializing payment.");
    }
  };
  

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  useEffect(() => {
    console.log("Current clientSecret:", clientSecret);
  }, [clientSecret]);

  return (
    <div>
      {!clientSecret ? (
        <>
          <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
            My Appointments
          </p>
          <div>
            {appointments.length > 0 &&
              appointments.map((item, index) => (
                <div
                  className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
                  key={index}
                >
                  <div>
                    <img
                      className="w-32 bg-indigo-50"
                      src={item.docData.image}
                      alt={item.docData.name}
                    />
                  </div>
                  <div className="flex-1 text-sm text-zinc-600">
                    <p className="text-neutral-800 font-semibold">
                      {item.docData.name}
                    </p>
                    <p>{item.speciality}</p>
                    <p className="text-zinc-700 font-medium mt-1">
                      Address:
                    </p>
                    <p className="text-sm">{item.docData.address.line1}</p>
                    <p className="text-sm">{item.docData.address.line2}</p>
                    <p className="text-sm mt-1">
                      <span className="text-sm font-semibold text-neutral-700">
                        Date & Time:
                      </span>{" "}
                      {slotDateFormat(item.slotDate)} | {item.slotTime}
                    </p>
                  </div>
                  <div></div>
                  <div className="flex flex-col gap-2 justify-end">
                    {!item.cancelled && (
                      <button
                        onClick={() => appointmentStripe(item._id)}
                        className="text-sm text-primary text-center sm:min-w-48 py-2 border border-primary rounded-md hover:text-white hover:bg-primary transition-all duration-300"
                      >
                        Pay Online
                      </button>
                    )}
                    <button
                      disabled={item.cancelled}
                      onClick={() => cancelAppointment(item._id)}
                      className={`text-sm  text-center sm:min-w-48 py-2 border ${
                        item.cancelled
                          ? "border-gray-500 text-gray-500"
                          : "border-red-500 text-red-500"
                      } rounded-md ${
                        !item.cancelled ? "hover:text-white" : ""
                      } ${
                        !item.cancelled ? "hover:bg-red-500" : ""
                      } transition-all duration-300`}
                    >
                      {item.cancelled ? "Cancelled" : "Cancel Appointment"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            onPaymentSuccess={() => {
              setClientSecret(null); // Reset state after successful payment
              getUserAppointments(); // Refresh appointments
            }}
          />
        </Elements>
      )}
    </div>
  );
  
};

export default MyAppointments;
