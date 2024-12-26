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

// get time without second

// const getFormattedTimeWithAMPM = (isoString, hideSecond = false) => {
//   // Create a Date object from the ISO string
//   const date = new Date(isoString);

//   // Get the hours, minutes, and seconds in the local time
//   let hours = date.getHours(); // Returns hours in 24-hour format (local time)
//   const minutes = date.getMinutes(); // Get minutes
//   const seconds = date.getSeconds(); // Get seconds
//   let period = "AM"; // Default period is AM

//   // Handle conversion from 24-hour to 12-hour format
//   if (hours >= 12) {
//     period = "PM";
//     if (hours > 12) {
//       hours -= 12; // Convert hours to 12-hour format
//     }
//   } else if (hours === 0) {
//     hours = 12; // Convert midnight (00:00) to 12:00 AM
//   }

//   // Return the formatted time in 12-hour format with seconds
//   return `${hours.toString().padStart(2, "0")}:${minutes
//     .toString()
//     .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;
// };

const getFormattedTimeWithAMPM = (isoString, hideSecond = false) => {
  // Create a Date object from the ISO string
  const date = new Date(isoString);

  // Get the hours, minutes, and seconds in the local time
  let hours = date.getHours(); // Returns hours in 24-hour format (local time)
  const minutes = date.getMinutes(); // Get minutes
  const seconds = date.getSeconds(); // Get seconds
  let period = "AM"; // Default period is AM

  // Handle conversion from 24-hour to 12-hour format
  if (hours >= 12) {
    period = "PM";
    if (hours > 12) {
      hours -= 12; // Convert hours to 12-hour format
    }
  } else if (hours === 0) {
    hours = 12; // Convert midnight (00:00) to 12:00 AM
  }

  // Format hours and minutes
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  // Conditionally add seconds
  const formattedSeconds = `:${seconds.toString().padStart(2, "0")}`;

  return hideSecond
    ? `${formattedTime} ${period}`
    : `${formattedTime}${formattedSeconds} ${period}`;
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
