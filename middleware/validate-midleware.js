const validate = schema => async (req, res, next) => {
  try {
    // Use parseAsync for asynchronous validation with zod
    const parsedBody = await schema.parseAsync(req.body);

    // Attach the parsed body back to the request
    req.body = parsedBody;

    // Proceed to the next middleware or controller
    next();
  } catch (e) {
    // If validation fails, return a 400 error with the validation error message
    res.status(400).json({ msg: e.errors });
  }
};

module.exports = validate;
