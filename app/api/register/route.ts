import { NextResponse } from 'next/server';
import * as z from 'zod';

// Server-side schema (can be extracted to a shared file to avoid duplication)
const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'STUDENT']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    // TODO: Insert user creation logic here (hash password, persist to DB, etc.)
    // For demonstration we return a minimal success response
    const safeUser = { email: parsed.email, role: parsed.role };
    return NextResponse.json({ message: 'User registered', user: safeUser }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}