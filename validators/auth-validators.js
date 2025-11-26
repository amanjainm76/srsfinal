const { z } = require("zod");

const signupSchema = z.object({
  username: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters." }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(3, { message: "Email must be at least 3 characters." })
    .email({ message: "Invalid email format" }),

  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits." }),

  city: z.string({ required_error: "City is required" }).trim(),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[0-9]/, { message: "Password must contain at least one digit." })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character.",
    })
    .max(20, { message: "Password must be at most 20 characters." }),

  userClass: z.string({ required_error: "Class is required" }).trim(),
  userStream: z.string({ required_error: "Stream is required" }).trim(),
  userCourse: z.string({ required_error: "Course is required" }).trim(),
});

module.exports = signupSchema;
