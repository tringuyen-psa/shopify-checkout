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
    const { fullName, email, password } = await request.json();

    // Validate input
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user (in production, hash the password)
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password, // In production, store hashed password
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Generate mock JWT token (in production, use proper JWT)
    const token = btoa(JSON.stringify({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }));

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
      token,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}