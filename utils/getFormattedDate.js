// Function to format the date for the input field
const getFormattedDate = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);

  // Options for the date format
  const options = { day: "numeric", month: "short", year: "numeric" };

  // Formatting the date to "10 Jan 2023"
  return date.toLocaleDateString("en-GB", options);
};

// get time with AM and PM

const getFormattedTimeWithAMPM = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);

  // Options for the date format, including seconds
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  // Formatting the date to include hours, minutes, and seconds with AM/PM
  return date.toLocaleTimeString("en-GB", options);
};

//convert to date
const convertTimeToDate = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number); // Split and parse the time string
  const now = new Date(); // Get the current date
  now.setHours(hours, minutes, 0, 0); // Set hours and minutes, reset seconds and milliseconds
  return now;
};

module.exports = {
  getFormattedDate,
  getFormattedTimeWithAMPM,
  convertTimeToDate,
};
