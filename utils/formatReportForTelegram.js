const {
  getFormattedDate,
  getFormattedTimeWithAMPM,
} = require("./getFormattedDate");

const formatAttendanceReportForTelegram = (data) => {
  const reportMessage = `
📅 *Attendance Report:* ${getFormattedDate(data.report_date)}

👥 *Total Attendance:* ${data.total_attendance}

⏰ *Late Employees:*
${
  data.late_employees
    .map(
      (item) => `- ${item.employee.name} (Late by ${item.checkInLateDuration})`
    )
    .join("\n") || "None"
}

🏃‍♂️ *Early Check-out Employees:*
${
  data.early_check_out_employees
    .map(
      (item) =>
        `- ${item.employee.name} (Checked out early by ${item.checkOutEarlyDuration})`
    )
    .join("\n") || "None"
}

🚫 *Missed Check-out Employees:*
${
  data.missed_check_out_employees
    .map((item) => `- ${item.employee.name}`)
    .join("\n") || "None"
}

❌ *Absent Employees:*
${
  data.absent_employees.map((item) => `- ${item.employee.name}`).join("\n") ||
  "None"
}

🌴 *On Leave Employees:*
${
  data.on_leave_employees.map((item) => `- ${item.employee.name}`).join("\n") ||
  "None"
}

✅ *Normal Checked Out Employees:*
${
  data.normal_checked_out_employees
    .map(
      (item) =>
        `- ${item.employee.name} (${getFormattedTimeWithAMPM(item.time_out)})`
    )
    .join("\n") || "None"
}

⏳ *On Time Employees:*
${
  data.on_time_employees
    .map(
      (item) =>
        `- ${item.employee.name} (${getFormattedTimeWithAMPM(item.time_in)})`
    )
    .join("\n") || "None"
}
  `;

  return reportMessage;
};

module.exports = {
  formatAttendanceReportForTelegram,
};
