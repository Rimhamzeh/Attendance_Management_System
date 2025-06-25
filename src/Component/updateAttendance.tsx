import { IoCloseSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {type AttendanceWithEmployee} from"../interfaces"

interface UpdateAttendanceProps {
  recordToEdit: AttendanceWithEmployee;
  handleClose: () => void;
  onUpdate: (updated: AttendanceWithEmployee) => void;
}

 function UpdateAttendance({
  recordToEdit,
  handleClose,
  onUpdate,
}: UpdateAttendanceProps) {
  const [inputs, setInputs] = useState({
    time_in: "",
    time_out: "",
    breakStart: "",
    breakEnd: "",
  });

 useEffect(() => {
  if (recordToEdit) {
    const formatTime = (time: string | null | undefined) =>
      time ? time.slice(0, 5) : ""; 
    setInputs({
      time_in: formatTime(recordToEdit.time_in),
      time_out: formatTime(recordToEdit.time_out),
      breakStart: formatTime(recordToEdit.breakStart),
      breakEnd: formatTime(recordToEdit.breakEnd),
    });
  }
}, [recordToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("attendance")
      .update({
        time_in: inputs.time_in,
        time_out: inputs.time_out,
        breakStart: inputs.breakStart,
        breakEnd: inputs.breakEnd,
      })
      .eq("id", recordToEdit.id);

    if (error) {
      alert("Error updating record: " + error.message);
      return;
    }

    const updatedRecord: AttendanceWithEmployee = {
      ...recordToEdit,
      ...inputs,
    };

    onUpdate(updatedRecord);
    handleClose();
  };

  return (
    <div className="p-4 bg-white border rounded shadow mt-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-lg font-semibold">Edit Attendance</h4>
          <p className="text-sm text-gray-500">Update attendance record fields</p>
        </div>
        <button
          className="text-red-600 hover:text-red-800"
          onClick={handleClose}
        >
          <IoCloseSharp size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Time In</label>
          <input
            name="time_in"
            type="time"
            className="w-full border px-3 py-2 rounded"
            value={inputs.time_in}
            onChange={handleChange}
            placeholder="Enter time in (e.g. 08:00)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time Out</label>
          <input
            name="time_out"
            type="time"
            className="w-full border px-3 py-2 rounded"
            value={inputs.time_out}
            onChange={handleChange}
            placeholder="Enter time out (e.g. 16:00)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Break Start</label>
          <input
            name="breakStart"
            type="time"
            className="w-full border px-3 py-2 rounded"
            value={inputs.breakStart}
            onChange={handleChange}
            placeholder="Enter break start"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Break End</label>
          <input
            name="breakEnd"
            type="time"
            className="w-full border px-3 py-2 rounded"
            value={inputs.breakEnd}
            onChange={handleChange}
            placeholder="Enter break end"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={handleClose}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleUpdate}
        >
          Update
        </button>
      </div>
    </div>
  );
}
export default UpdateAttendance;