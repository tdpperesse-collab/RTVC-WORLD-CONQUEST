// Configuration NextAuth.js v4 — RTVC Koumé
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  // Pas d'adaptateur Prisma : on utilise le provider Credentials pur.
  providers: [
    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        email: { label: 'E-mail', type: 'email', placeholder: 'vous@exemple.org' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-mail et mot de passe requis.')
        }
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })
        if (!user) throw new Error('Aucun compte trouvé avec cet e-mail.')
        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) throw new Error('Mot de passe incorrect.')
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'rtvc-koume-dev-secret-change-in-prod',
}
