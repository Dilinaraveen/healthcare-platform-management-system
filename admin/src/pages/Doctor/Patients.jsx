import React from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useContext } from "react";
import { useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import MedicalRecordsModal from "../../components/MedicalRecordsModal";
import { useState } from "react";

function Patients() {
  const { dToken, patients, getPatients,medicalRecords, setMedicalRecords } = useContext(DoctorContext);
  const { calculateAge } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);


  useEffect(() => {
    if (dToken) {
      getPatients();
    }
  }, [dToken]);

  const handleView = (item) => {
    setSelectedPatient(item);
    setShowModal(true);
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">Patients</p>

      <div className="bg-white border rounded text-sm max-h-[80h] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Action</p>
        </div>

        {patients.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={item.image}
                alt=""
              />{" "}
              <p>{item.name}</p>
            </div>
            <p>{calculateAge(item.dob)}</p>
            <button
              onClick={() => handleView(item)}
              className="w-fit text-blue-500 text-xs font-medium border border-blue-500 px-2.5 py-0.5 rounded-full hover:bg-blue-500 hover:text-white"
            >
              View Records
            </button>
          </div>
        ))}
      </div>
      {showModal && selectedPatient && (
        <MedicalRecordsModal
          patient={selectedPatient}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}

export default Patients;
