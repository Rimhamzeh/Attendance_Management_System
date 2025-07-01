import { IoCloseSharp, IoAdd } from "react-icons/io5";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { type AttendanceWithEmployee, type Break } from "../interfaces";
import { useTheme } from "../context";
import Swal from "sweetalert2";

interface UpdateAttendanceProps {
  recordToEdit: AttendanceWithEmployee;
  handleClose: () => void;
  onUpdate: (updated: AttendanceWithEmployee) => void;
  theme?: string;
}

function UpdateAttendance({
  recordToEdit,
  handleClose,
  onUpdate,
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

  // Helper function to remove leading zeros from time display
  const formatTimeDisplay = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const parsedHours = parseInt(hours, 10);
    return `${parsedHours}:${minutes}`;
  };

  // Helper function to ensure time is in HH:MM format for storage
  const ensureTimeFormat = (time: string) => {
    if (!time) return "";
    if (time.includes(":")) {
      const [hours, minutes] = time.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    }
    return time;
  };

  useEffect(() => {
    const fetchBreaks = async () => {
      if (recordToEdit?.id) {
        const { data, error } = await supabase
          .from("breaks")
          .select("*")
          .eq("attendance_id", recordToEdit.id);

        if (!error && data) {
          setBreaks(data);
        }
      }
    };

    fetchBreaks();

    if (recordToEdit) {
      const formatTime = (time: string | null | undefined) =>
        time ? ensureTimeFormat(time.slice(0, 5)) : "";

      setInputs({
        time_in: formatTime(recordToEdit.time_in),
        time_out: formatTime(recordToEdit.time_out),
        over_time: recordToEdit.over_time || "",
      });
    }
  }, [recordToEdit]);

  const toMinutes = (time: string) => {
    const formattedTime = ensureTimeFormat(time);
    const [h, m] = formattedTime.split(":").map(Number);
    return h * 60 + m;
  };

  // Check overlap helper
  const isOverlap = (
    start: string,
    end: string,
    breaksArray: Break[],
    excludeId?: string | null
  ) => {
    const startM = toMinutes(start);
    const endM = toMinutes(end);

    return breaksArray.some((br) => {
      if (excludeId && br.id === excludeId) return false;
      const brStartM = toMinutes(br.start_time);
      const brEndM = toMinutes(br.end_time);
      return startM < brEndM && endM > brStartM;
    });
  };

  const handleAddBreak = async () => {
    const formattedNewBreak = {
      start: ensureTimeFormat(newBreak.start),
      end: ensureTimeFormat(newBreak.end),
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

    const timeInMinutes = toMinutes(inputs.time_in);
    const timeOutMinutes = toMinutes(inputs.time_out);
    const breakStartMinutes = toMinutes(formattedNewBreak.start);
    const breakEndMinutes = toMinutes(formattedNewBreak.end);

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

    if (isOverlap(formattedNewBreak.start, formattedNewBreak.end, breaks)) {
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
        attendance_id: recordToEdit.id,
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

    setBreaks([...breaks, data[0]]);
    setNewBreak({ start: "", end: "" });
    setIsAddingBreak(false);
  };

  const handleEditBreak = async () => {
    const formattedEditedBreak = {
      start: ensureTimeFormat(editedBreak.start),
      end: ensureTimeFormat(editedBreak.end),
    };

    if (!formattedEditedBreak.start || !formattedEditedBreak.end || !editingBreakId)
      return;

    const timeInMinutes = toMinutes(inputs.time_in);
    const timeOutMinutes = toMinutes(inputs.time_out);
    const breakStartMinutes = toMinutes(formattedEditedBreak.start);
    const breakEndMinutes = toMinutes(formattedEditedBreak.end);

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
      isOverlap(formattedEditedBreak.start, formattedEditedBreak.end, breaks, editingBreakId)
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
      await Swal.fire("Error", "Failed to update break: " + error.message, "error");
      return;
    }

    setBreaks((prev) =>
      prev.map((br) =>
        br.id === editingBreakId
          ? { ...br, start_time: formattedEditedBreak.start, end_time: formattedEditedBreak.end }
          : br
      )
    );

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

    setBreaks(breaks.filter((br) => br.id !== breakId));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: ensureTimeFormat(value) }));
  };

  const handleBreakChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "start" | "end"
  ) => {
    const { value } = e.target;
    if (editingBreakId) {
      setEditedBreak((prev) => ({ ...prev, [field]: formatTimeDisplay(value) }));
    } else {
      setNewBreak((prev) => ({ ...prev, [field]: formatTimeDisplay(value) }));
    }
  };

  const handleClear = (field: keyof typeof inputs) => {
    setInputs((prev) => ({ ...prev, [field]: "" }));
  };

  const handleClearBreakTime = (field: "start" | "end") => {
    if (editingBreakId) {
      setEditedBreak((prev) => ({ ...prev, [field]: "" }));
    } else {
      setNewBreak((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleUpdate = async () => {
    const formattedInputs = {
      time_in: ensureTimeFormat(inputs.time_in),
      time_out: ensureTimeFormat(inputs.time_out),
      over_time: ensureTimeFormat(inputs.over_time),
    };

    if (
      formattedInputs.time_in &&
      formattedInputs.time_out &&
      toMinutes(formattedInputs.time_out) <= toMinutes(formattedInputs.time_in)
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
      toMinutes(formattedInputs.over_time) <= toMinutes(formattedInputs.time_out)
    ) {
      await Swal.fire({
        text: "Overtime must be after Time Out.",
        icon: "warning",
      });
      return;
    }

    const normalizeTime = (value: string) =>
      value.trim() === "" ? null : ensureTimeFormat(value);

    const { error } = await supabase
      .from("attendance")
      .update({
        time_in: normalizeTime(inputs.time_in),
        time_out: normalizeTime(inputs.time_out),
        over_time: normalizeTime(inputs.over_time),
      })
      .eq("id", recordToEdit.id);

    if (error) {
      alert("Error updating record: " + error.message);
      return;
    }

    const updatedRecord: AttendanceWithEmployee = {
      ...recordToEdit,
      time_in: normalizeTime(inputs.time_in),
      time_out: normalizeTime(inputs.time_out),
      over_time: normalizeTime(inputs.over_time),
      breaks,
    };

    onUpdate(updatedRecord);
    handleClose();
  };

  const inputClass = `w-full px-3 py-2 pr-10 rounded border transition-colors ${
    theme === "dark"
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
      : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;

  const buttonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-gray-600 hover:bg-gray-500 text-white"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
  }`;

  const primaryButtonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-blue-600 hover:bg-blue-500 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white"
  }`;

  const dangerButtonClass = `px-3 py-1 rounded text-sm transition-colors ${
    theme === "dark"
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-red-500 hover:bg-red-600 text-white"
  }`;

  return (
    <div
      className={`p-6 rounded-lg shadow-lg max-w-md mx-auto lg:w-[500px] ${
        theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border transition-colors duration-200`}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4
            className={`text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Attendance
          </h4>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Update attendance record fields
          </p>
        </div>
        <button
          onClick={handleClose}
          className={`rounded-full p-1 ${
            theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-800"
          }`}
          aria-label="Close"
        >
          <IoCloseSharp size={24} />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        <div className="space-y-5">
          {["time_in", "time_out", "over_time"].map((field) => (
            <div key={field}>
              <label className={labelClass}>
                {field === "time_in"
                  ? "Time In"
                  : field === "time_out"
                  ? "Time Out"
                  : "Overtime"}
              </label>
              <div className="relative flex items-center">
                <input
                  name={field}
                  type="time"
                  className={`${inputClass} pr-10`}
                  value={inputs[field as keyof typeof inputs]}
                  onChange={
                    field === "over_time"
                      ? (e) =>
                          setInputs((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                      : handleChange
                  }
                  placeholder="HH:MM"
                />
                {inputs[field as keyof typeof inputs] && (
                  <button
                    type="button"
                    onClick={() => handleClear(field as keyof typeof inputs)}
                    className="absolute right-2 text-gray-400 hover:text-red-500"
                    aria-label={`Clear ${field}`}
                  >
                    <IoCloseSharp size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div>
            <label className={labelClass}>Breaks</label>
            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              {breaks.length > 0 ? (
                breaks.map((br) => {
                  const startTime = formatTimeDisplay(br.start_time.slice(0, 5));
                  const endTime = formatTimeDisplay(br.end_time.slice(0, 5));

                  return (
                    <div
                      key={br.id}
                      className={`flex flex-col sm:flex-row justify-between items-center gap-2 p-2 rounded mb-2 last:mb-0 ${
                        theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                      }`}
                    >
                      {editingBreakId === br.id ? (
                        <div className="w-full">
                          <div className="flex flex-col sm:flex-row gap-2 mb-2">
                            <div className="relative flex-1">
                              <input
                                type="time"
                                value={editedBreak.start}
                                onChange={(e) => handleBreakChange(e, "start")}
                                className={`${inputClass} w-full`}
                              />
                              {editedBreak.start && (
                                <button
                                  type="button"
                                  onClick={() => handleClearBreakTime("start")}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                                >
                                  <IoCloseSharp size={16} />
                                </button>
                              )}
                            </div>
                            <span className="flex items-center justify-center mx-2">to</span>
                            <div className="relative flex-1">
                              <input
                                type="time"
                                value={editedBreak.end}
                                onChange={(e) => handleBreakChange(e, "end")}
                                className={`${inputClass} w-full`}
                              />
                              {editedBreak.end && (
                                <button
                                  type="button"
                                  onClick={() => handleClearBreakTime("end")}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                                >
                                  <IoCloseSharp size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBreakId(null);
                                setEditedBreak({ start: "", end: "" });
                              }}
                              className={buttonClass}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleEditBreak}
                              className={primaryButtonClass}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm sm:text-base">
                            {startTime} - {endTime}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBreakId(br.id);
                                setEditedBreak({
                                  start: formatTimeDisplay(br.start_time.slice(0, 5)),
                                  end: formatTimeDisplay(br.end_time.slice(0, 5)),
                                });
                              }}
                              className={buttonClass}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBreak(br.id)}
                              className={dangerButtonClass}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  No breaks added.
                </p>
              )}

              {isAddingBreak ? (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="time"
                        value={newBreak.start}
                        onChange={(e) => handleBreakChange(e, "start")}
                        className={inputClass}
                      />
                      {newBreak.start && (
                        <button
                          type="button"
                          onClick={() => handleClearBreakTime("start")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                        >
                          <IoCloseSharp size={16} />
                        </button>
                      )}
                    </div>
                    <span className="flex items-center justify-center">to</span>
                    <div className="relative flex-1">
                      <input
                        type="time"
                        value={newBreak.end}
                        onChange={(e) => handleBreakChange(e, "end")}
                        className={inputClass}
                      />
                      {newBreak.end && (
                        <button
                          type="button"
                          onClick={() => handleClearBreakTime("end")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                        >
                          <IoCloseSharp size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBreak(false);
                        setNewBreak({ start: "", end: "" });
                      }}
                      className={buttonClass}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBreak}
                      className={primaryButtonClass}
                    >
                      Add Break
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingBreak(true)}
                  className={`mt-3 ${primaryButtonClass} flex items-center gap-1`}
                >
                  <IoAdd size={18} />
                  Add Break
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-3 border-t border-gray-300 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClose}
              className={buttonClass}
            >
              Cancel
            </button>
            <button type="submit" className={primaryButtonClass}>
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default UpdateAttendance;
