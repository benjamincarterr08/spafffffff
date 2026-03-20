import { SignJWT } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, roles } = body
    
    if (!user || !user.uid) {
      return NextResponse.json(
        { success: false, message: 'User data is required' },
        { status: 400 }
      )
    }
    
    // Create JWT token using jose
    const secret = new TextEncoder().encode(JWT_SECRET)
    
    const token = await new SignJWT({
      uid: user.uid,
      username: user.username,
      email: user.email,
      roles: roles?.map((r: { rid: number; role_display_name: string }) => ({
        rid: r.rid,
        name: r.role_display_name,
      })) || [],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setSubject(String(user.uid))
      .sign(secret)
    
    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
