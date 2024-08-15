// import { registerSchema } from "@/schemas";
// import * as z from "zod";
// import bcrypt from "bcryptjs";
// import { db } from "@/lib/db";
// import { findUserByEmail } from "@/data/user";

// export async function POST(request: Request) {
//   const body = await request.json();
//   const validatedFields = registerSchema.safeParse(body);
//   console.log(validatedFields);
//   if (!validatedFields.success) {
//     return Response.json(
//       { success: false, error: "Invalid fields" },
//       { status: 400 },
//     );
//   }

//   const { name, email, password } = validatedFields.data;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const existingUser = await findUserByEmail(email);
//   if (existingUser)
//     return Response.json(
//       { success: false, error: "email already in use" },
//       { status: 409 },
//     );
//   await db.user.create({
//     data: {
//       name,
//       email,
//       password: hashedPassword,
//     },
//   });
//   return Response.json(
//     { success: true, message: "Verification email sent" },
//     { status: 201 },
//   );
// }

import { registerSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/services/user-service";
import rateLimitIP from "@/utils/rate-limit";
import ErrorWithStatus from "@/exception/custom-error";

export async function POST(request: Request) {
  try {
    await rateLimitIP(request);
    const body = await request.json();
    const validatedFields = registerSchema.safeParse(body);
    console.log(validatedFields);
    if (!validatedFields.success) {
      throw new ErrorWithStatus("Invalid fields", 400);
    }

    const { name, email, password } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await getUserByEmail(email);
    if (existingUser) throw new ErrorWithStatus("email already in use", 409);
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return Response.json(
      { success: true, message: "Registration successful" },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
