const errorMiddleware = (err, req, res, next) => {
  // Use logical OR (||) to provide default values
  const status = err.status || 500; // Default to 500 if err.status is falsy (e.g., undefined)
  const message = err.message || "Backend Error"; // Default message
  const extraDetails = err.extraDetails || "Error from Backend"; // Default extra details

  // Send the error response
  return res.status(status).json({ message, extraDetails });
};

module.exports = errorMiddleware;
