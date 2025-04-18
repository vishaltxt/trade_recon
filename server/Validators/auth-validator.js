import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be atleast 3 characters" })
    .max(100, { message: "Name must not be more than 100 characters long" }),
    email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({message:"Invalid email address"})
    .min(3, { message: "Email must be atleast 3 characters" })
    .max(100, { message: "email must not be more than 100 characters long" }),
  phone: z
    .string({ required_error: "Phone is required" })
    .trim()
    .min(10, { message: "Phone must be atleast 10 characters" })
    .max(10, { message: "Phone must not be more than 10 characters" }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(6, { message: "Password must be atleast of 6 characters" })
    .max(6, { message: "Password can't be greater than 1024 characters" }),
});
