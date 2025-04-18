export const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "BACKEND ERROR";
  const extraDetais = err.errorMiddleware || "Error from Backend";

  return res.status(status).json({ message, extraDetais });

};
