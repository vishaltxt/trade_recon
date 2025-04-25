import { z } from "zod";

export const formSchema = z.object({
  firstName: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be atleast 3 characters" })
    .max(100, { message: "Name must not be more than 100 characters long" }),
    lastName: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be atleast 3 characters" }),
    email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({message:"Invalid email address"})
    .min(3, { message: "Email must be atleast 3 characters" })
    .max(100, { message: "email must not be more than 100 characters long" }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(6, { message: "Password must be atleast of 6 characters" })
    .max(6, { message: "Password can't be greater than 1024 characters" }),
    role: z
    .string({ required_error: "Role is required" })
});
