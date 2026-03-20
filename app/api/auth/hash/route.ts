import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      )
    }
    
    const saltRounds = 10
    const passhash = await bcrypt.hash(password, saltRounds)
    
    return NextResponse.json({ success: true, passhash })
  } catch (error) {
    console.error('Password hashing error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to hash password' },
      { status: 500 }
    )
  }
}
