import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { use } from "react";

function Records() {
  const {
    userMedicalRecords,
    getMedicalRecordsByUser,
    userData,
    slotDateFormat,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (userData && userData._id) {
      getMedicalRecordsByUser(userData._id).finally(() => setLoading(false));
    }
  }, [userData]);

  return (
    <div>
      {loading ? (
        <p>Loading medical records...</p>
      ) : userMedicalRecords && userMedicalRecords.length > 0 ? (
        <div className="flex flex-col gap-4">
          {userMedicalRecords.map((record, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={record.docData.image}
                  alt={record.docData.name}
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <h2 className="text-lg font-semibold">{record.docData.name}</h2>
                <p>
                  <strong>Date:</strong> {slotDateFormat(record.date)}
                </p>
                <p className="mt-1">
                  <strong>Description:</strong> {record.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No medical records found.</p>
      )}
    </div>
  );
}

export default Records;
