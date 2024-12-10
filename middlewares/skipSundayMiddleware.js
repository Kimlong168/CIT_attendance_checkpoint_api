const skipSundayMiddleware = (jobFunction) => {
  return () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Skip if today is Sunday
    if (dayOfWeek === 0) {
      console.log("Skipping job: No attendance recording on Sunday.");
      return;
    }

    // Execute the actual job function
    jobFunction();
  };
};

module.exports =  skipSundayMiddleware ;
