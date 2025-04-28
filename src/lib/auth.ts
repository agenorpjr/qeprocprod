import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import db from "./db/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod";
import { v4 as uuid } from 'uuid'
import { encode } from "next-auth/jwt"
import { authConfig } from "./auth.config"
import bcrypt from 'bcryptjs'

const adapter = PrismaAdapter(db)

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      profile(profile){
        return { role: profile.role ?? "user"}
      },
      authorize: async (credentials) => {

        const validatedCredentials = z.object({
          email: z.string().email(),
          password: z.string().min(6)
        }).safeParse(credentials)

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data
          const user = await db.user.findFirst({
            where: { email: email }
          })

          if (!user) {
            throw new Error("Email não encontrado")
          }
          const passwordsMatch = bcrypt.compare(password, user?.password)
          if (passwordsMatch) return user;
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      
      if (account?.provider === 'credentials') {
        token.credentials = true
      }
      
      return token
    },
    session({ session, user }) {
      session.user.role = user?.role
      return session
    },
 },
  jwt: {
    encode: async function (params) {
      
      if (params.token?.credentials) {
        const sessionToken = uuid();
        
        if (!params.token.sub) {
          throw new Error("No user ID found in token")
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + ( 3600 * 1000 * 24))
        })

        if (!createdSession) {
          throw new Error("Failed to create session")
        }
        
        return sessionToken
      }
      return encode(params)
    }
  },

  
})