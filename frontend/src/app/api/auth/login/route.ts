import { NextRequest, NextResponse } from 'next/server';

// Mock user database (in production, this would be a real database)
const users: Array<{
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}> = [
  // Demo user for testing
  {
    id: '1',
    fullName: 'Demo User',
    email: 'demo@example.com',
    password: 'demo123',
    createdAt: new Date().toISOString(),
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (in production, compare with hashed password)
    if (user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate mock JWT token (in production, use proper JWT)
    const token = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }));

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}