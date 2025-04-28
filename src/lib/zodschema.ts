import { z } from "zod";

const zodschema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export { zodschema }
