export const parseTime = (dateStr: string, time: string): Date | null => {
  if (!time || !dateStr) return null;
  const [h, m] = time.split(":").map(Number);
  const date = new Date(dateStr);
  date.setHours(h, m, 0, 0);
  return date;
};

export const validateTimes = (
  selectedEmployee: string,
  date: string,
  timeIn: string,
  timeOut: string,
  breaks: { start_time: string; end_time: string }[],
  toast: any
): boolean => {
  if (!selectedEmployee) {
    toast.warning("Please select an employee");
    return false;
  }

  if (!timeIn || !timeOut) {
    toast.warning("Please enter both Time In and Time Out");
    return false;
  }

  const timeInDate = parseTime(date, timeIn);
  const timeOutDate = parseTime(date, timeOut);

  if (!timeInDate || !timeOutDate) {
    toast.warning("Invalid time format");
    return false;
  }

  if (timeOutDate <= timeInDate) {
    toast.warning("Time Out must be later than Time In");
    return false;
  }

  for (const brk of breaks) {
    const breakStartDate = parseTime(date, brk.start_time);
    const breakEndDate = parseTime(date, brk.end_time);

    if (!breakStartDate || !breakEndDate) {
      toast.warning("Invalid break time format");
      return false;
    }

    if (breakEndDate <= breakStartDate) {
      toast.warning("Break End must be later than Break Start");
      return false;
    }

    if (breakStartDate < timeInDate || breakEndDate > timeOutDate) {
      toast.warning("Break times must be between Time In and Time Out");
      return false;
    }
  }

  return true;
};
