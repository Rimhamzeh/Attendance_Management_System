import React, { useState, useEffect } from "react";
import { IoCloseSharp, IoAdd } from "react-icons/io5";
import Swal from "sweetalert2";
import { supabase } from "../../Utils/supabaseClient";
import { useTheme } from "../../Utils/context";
import AttendanceTimeInputs from "./attendanceTimeInputs";
import BreakList from "./Breaks/breakList";
import BreakForm from "./Breaks/breakForm";
import * as utils from "../../Utils/timeHelper";

import type { AttendanceWithEmployee, Break } from "../../Utils/interfaces";

interface UpdateAttendanceProps {
  record: AttendanceWithEmployee;
  onClose: () => void;
  onSaved: (updatedRecord: AttendanceWithEmployee) => void;
  theme?: string;
}

export default function UpdateAttendance({
  record,
  onClose,
  onSaved,
  theme: propTheme,
}: UpdateAttendanceProps) {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  const [inputs, setInputs] = useState({
    time_in: "",
    time_out: "",
    over_time: "",
  });
  const [breaks, setBreaks] = useState<Break[]>([]);

  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [newBreak, setNewBreak] = useState({ start: "", end: "" });

  const [editingBreakId, setEditingBreakId] = useState<string | null>(null);
  const [editedBreak, setEditedBreak] = useState({ start: "", end: "" });


  const fetchBreaks = async () => {
    if (record?.id) {
      const { data, error } = await supabase
        .from("breaks")
        .select("*")
        .eq("attendance_id", record.id);
      if (!error && data) setBreaks(data);
    }
  };

  useEffect(() => {
    fetchBreaks();

    if (record) {
      const formatTime = (time: string | null | undefined) =>
        time ? utils.ensureTimeFormat(time.slice(0, 5)) : "";

      setInputs({
        time_in: formatTime(record.time_in),
        time_out: formatTime(record.time_out),
        over_time: record.over_time || "",
      });
    }
  }, [record]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: utils.ensureTimeFormat(value) }));
  };

  const handleClearInput = (field: keyof typeof inputs) => {
    setInputs((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBreakChange = (field: "start" | "end", value: string) => {
    if (editingBreakId) {
      setEditedBreak((prev) => ({
        ...prev,
        [field]: utils.formatTimeDisplay(value),
      }));
    } else {
      setNewBreak((prev) => ({
        ...prev,
        [field]: utils.formatTimeDisplay(value),
      }));
    }
  };

  const handleClearBreakTime = (field: "start" | "end") => {
    if (editingBreakId) {
      setEditedBreak((prev) => ({ ...prev, [field]: "" }));
    } else {
      setNewBreak((prev) => ({ ...prev, [field]: "" }));
    }
  };

  
  const handleAddBreak = async () => {
    const formattedNewBreak = {
      start: utils.ensureTimeFormat(newBreak.start),
      end: utils.ensureTimeFormat(newBreak.end),
    };

    if (!formattedNewBreak.start || !formattedNewBreak.end) {
      await Swal.fire({
        icon: "warning",
        title: "Missing time",
        text: "Please enter both start and end times for the break.",
      });
      return;
    }

    if (!inputs.time_in || !inputs.time_out) {
      await Swal.fire({
        icon: "warning",
        title: "Set Time In/Out",
        text: "Please set both Time In and Time Out before adding a break.",
      });
      return;
    }

    const timeInMinutes = utils.toMinutes(inputs.time_in);
    const timeOutMinutes = utils.toMinutes(inputs.time_out);
    const breakStartMinutes = utils.toMinutes(formattedNewBreak.start);
    const breakEndMinutes = utils.toMinutes(formattedNewBreak.end);

    if (breakEndMinutes <= breakStartMinutes) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Break Time",
        text: "Break end time must be after break start time.",
      });
      return;
    }

    if (breakStartMinutes < timeInMinutes || breakEndMinutes > timeOutMinutes) {
      await Swal.fire({
        icon: "warning",
        title: "Break Outside Attendance Time",
        text: "Break time must be between Time In and Time Out.",
      });
      return;
    }

    if (
      utils.isOverlap(formattedNewBreak.start, formattedNewBreak.end, breaks)
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Break Overlap",
        text: "This break overlaps with an existing break. Please choose a different time.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("breaks")
      .insert({
        attendance_id: record.id,
        start_time: formattedNewBreak.start,
        end_time: formattedNewBreak.end,
      })
      .select();

    if (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error adding break: " + error.message,
      });
      return;
    }

   
    await fetchBreaks();
    setNewBreak({ start: "", end: "" });
    setIsAddingBreak(false);
  };

  
  const handleEditBreak = async () => {
    if (!editingBreakId) return;

    const formattedEditedBreak = {
      start: utils.ensureTimeFormat(editedBreak.start),
      end: utils.ensureTimeFormat(editedBreak.end),
    };

    if (!formattedEditedBreak.start || !formattedEditedBreak.end) return;

    const timeInMinutes = utils.toMinutes(inputs.time_in);
    const timeOutMinutes = utils.toMinutes(inputs.time_out);
    const breakStartMinutes = utils.toMinutes(formattedEditedBreak.start);
    const breakEndMinutes = utils.toMinutes(formattedEditedBreak.end);

    if (breakEndMinutes <= breakStartMinutes) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Break Time",
        text: "Break end time must be after break start time.",
      });
      return;
    }

    if (breakStartMinutes < timeInMinutes || breakEndMinutes > timeOutMinutes) {
      await Swal.fire({
        icon: "warning",
        title: "Break Outside Attendance Time",
        text: "Break time must be between Time In and Time Out.",
      });
      return;
    }

    if (
      utils.isOverlap(
        formattedEditedBreak.start,
        formattedEditedBreak.end,
        breaks,
        editingBreakId
      )
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Break Overlap",
        text: "This break overlaps with another break. Please choose a different time.",
      });
      return;
    }

    const { error } = await supabase
      .from("breaks")
      .update({
        start_time: formattedEditedBreak.start,
        end_time: formattedEditedBreak.end,
      })
      .eq("id", editingBreakId);

    if (error) {
      await Swal.fire(
        "Error",
        "Failed to update break: " + error.message,
        "error"
      );
      return;
    }


    await fetchBreaks();

    setEditingBreakId(null);
    setEditedBreak({ start: "", end: "" });
  };

  
  const handleDeleteBreak = async (breakId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("breaks").delete().eq("id", breakId);

    if (error) {
      alert("Error deleting break: " + error.message);
      return;
    }

   
    await fetchBreaks();
  };

 
  const handleEditClick = (id: string, start: string, end: string) => {
    setEditingBreakId(id);
    setEditedBreak({ start, end });
  };

  const handleUpdate = async () => {
    const formattedInputs = {
      time_in: inputs.time_in ? utils.ensureTimeFormat(inputs.time_in) : null,
      time_out: inputs.time_out
        ? utils.ensureTimeFormat(inputs.time_out)
        : null,
      over_time: inputs.over_time
        ? utils.ensureTimeFormat(inputs.over_time)
        : null,
    };

    if (
      formattedInputs.time_in &&
      formattedInputs.time_out &&
      utils.toMinutes(formattedInputs.time_out) <=
        utils.toMinutes(formattedInputs.time_in)
    ) {
      await Swal.fire({
        text: "Time out must be after time in.",
        icon: "warning",
      });
      return;
    }

    if (
      formattedInputs.over_time &&
      formattedInputs.time_out &&
      utils.toMinutes(formattedInputs.over_time) <
        utils.toMinutes(formattedInputs.time_out)
    ) {
      await Swal.fire({
        text: "Overtime must be after time out.",
        icon: "warning",
      });
      return;
    }

    const timeInM = formattedInputs.time_in
      ? utils.toMinutes(formattedInputs.time_in)
      : null;
    const timeOutM = formattedInputs.time_out
      ? utils.toMinutes(formattedInputs.time_out)
      : null;

    if (timeInM === null || timeOutM === null) {
      await Swal.fire({
        text: "Time In and Time Out must be set.",
        icon: "warning",
      });
      return;
    }

    for (const br of breaks) {
      const brStartM = utils.toMinutes(br.start_time);
      const brEndM = utils.toMinutes(br.end_time);
      if (brStartM < timeInM || brEndM > timeOutM) {
        await Swal.fire({
          text: "One or more breaks are outside the attendance time range.",
          icon: "warning",
        });
        return;
      }
    }

    const { error } = await supabase
      .from("attendance")
      .update(formattedInputs)
      .eq("id", record.id);

    if (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
      return;
    }

    const updatedRecord = { ...record, ...formattedInputs };
    onSaved(updatedRecord);
    onClose();
  };

  return (
    <div
      className={`p-6 w-[390px] rounded-lg shadow-lg max-w-md mx-auto lg:w-[500px] ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-900"
      } border transition-colors duration-200`}
    >
     
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Update Attendance</h3>
        <button onClick={onClose} aria-label="Close form">
          <IoCloseSharp size={24} />
        </button>
      </div>

      
      <AttendanceTimeInputs
        inputs={inputs}
        onChange={handleInputChange}
        onClear={handleClearInput}
        theme={theme}
      />

 
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold">Breaks</h4>
          {!isAddingBreak && editingBreakId === null && (
            <button
              className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsAddingBreak(true)}
            >
              <IoAdd />
              Add Break
            </button>
          )}
        </div>

       
        <BreakList
          breaks={breaks}
          editingBreakId={editingBreakId}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteBreak}
          theme={theme}
          formatTimeDisplay={utils.formatTimeDisplay}
        />

        {isAddingBreak && (
          <BreakForm
            breakData={newBreak}
            onChange={handleBreakChange}
            onClear={handleClearBreakTime}
            onCancel={() => {
              setIsAddingBreak(false);
              setNewBreak({ start: "", end: "" });
            }}
            onSave={handleAddBreak}
            theme={theme}
          />
        )}

        {editingBreakId && (
          <BreakForm
            breakData={editedBreak}
            onChange={handleBreakChange}
            onClear={handleClearBreakTime}
            onCancel={() => {
              setEditingBreakId(null);
              setEditedBreak({ start: "", end: "" });
            }}
            onSave={handleEditBreak}
            theme={theme}
            isEditing
          />
        )}
      </div>

  
      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className={`px-5 py-2 rounded ${
            theme === "dark"
              ? "bg-gray-600 hover:bg-gray-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
          }`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUpdate}
          className={`px-5 py-2 rounded ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
}
