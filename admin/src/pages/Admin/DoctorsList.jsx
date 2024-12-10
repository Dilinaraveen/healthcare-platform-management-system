import React from "react";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
    console.log("doctors", doctors);
  }, []);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6 ">
        {doctors?.length > 0 ? (
          doctors.map((doctor, index) => (
            <div
              key={index}
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            >
              <img
                src={doctor.image}
                alt={doctor.name}
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
              />
              <div className="p-4">
                <p className="text-neutral-800 font-medium text-lg">
                  {doctor.name}
                </p>
                <p className="text-zinc-600 text-sm">{doctor.speciality}</p>
                <div className="mt-2 flex itemss-center gap-1 text-sm">
                  <input
                    onChange={() => changeAvailability(doctor._id)}
                    type="checkbox"
                    checked={doctor.available}
                  />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No doctors available</p>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
