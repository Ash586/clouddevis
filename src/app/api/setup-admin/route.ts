import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const email = 'selmaniabilal@gmail.com';
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Admin already exists', email });
    }
    const hashed = await bcrypt.hash('NourAlislam1993@', 12);
    await prisma.admin.create({
      data: { email, password: hashed, name: 'Super Admin', role: 'ADMIN' },
    });
    return NextResponse.json({ message: 'Admin created', email });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
