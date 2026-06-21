// Inscription d'un nouvel utilisateur
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
        { status: 400 }
      )
    }
    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet e-mail.' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { name, email: normalizedEmail, password: hashed, role: 'USER' },
    })

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (e) {
    console.error('[register] error', e)
    return NextResponse.json({ error: 'Erreur serveur, réessayez.' }, { status: 500 })
  }
}
