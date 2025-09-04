import { z } from "zod";

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    age: z.number().int().optional()
});

export type User = z.infer<typeof UserSchema>;