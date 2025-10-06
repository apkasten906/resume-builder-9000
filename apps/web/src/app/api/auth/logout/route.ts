import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚪 Logout API: Starting logout process');

    // Log all cookies to debug
    const allCookies = request.cookies.getAll();
    console.log('🍪 Logout API: All cookies:', allCookies);

    // Forward the logout request to the backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/logout`;
    console.log('🔗 Logout API: Backend URL:', backendUrl);

    // Get the session cookie to forward to backend
    const sessionCookie = request.cookies.get('session');
    console.log('🍪 Logout API: Session cookie:', sessionCookie);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward the session cookie if it exists
    if (sessionCookie) {
      headers.Cookie = `${sessionCookie.name}=${sessionCookie.value}`;
      console.log('📤 Logout API: Forwarding cookie to backend');
    }

    // Call the backend logout endpoint
    console.log('📡 Logout API: Calling backend logout...');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
    });

    console.log(`📡 Logout API: Backend response - ${response.status} ${response.statusText}`);

    if (response.ok) {
      // Create response and clear the session cookie
      const nextResponse = NextResponse.json({ ok: true });
      console.log('✅ Logout API: Backend logout successful, clearing cookies...');

      // Clear the session cookie with the same attributes as it was set
      // Using both delete() and set with expired date for maximum compatibility
      nextResponse.cookies.delete('session');
      nextResponse.cookies.set('session', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        expires: new Date(0), // Expire immediately
        maxAge: 0, // Also set maxAge to 0
      });

      console.log('🗑️ Logout API: Session cookie cleared via delete() and expire');
      return nextResponse;
    } else {
      // Even if backend logout fails, clear the cookie on frontend
      console.log('⚠️ Logout API: Backend logout failed, but clearing cookie anyway');
      const nextResponse = NextResponse.json(
        { error: 'Logout failed' },
        { status: response.status }
      );

      // Clear the session cookie even on backend failure
      nextResponse.cookies.delete('session');
      nextResponse.cookies.set('session', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        expires: new Date(0),
        maxAge: 0,
      });

      console.log('🗑️ Logout API: Cookie cleared on backend failure');
      return nextResponse;
    }
  } catch (error) {
    console.error('❌ Logout API error:', error);

    // Even on error, clear the cookie
    const nextResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    console.log('⚠️ Logout API: Exception occurred, clearing cookie anyway');
    nextResponse.cookies.delete('session');
    nextResponse.cookies.set('session', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });

    console.log('🗑️ Logout API: Cookie cleared on error');
    return nextResponse;
  }
}
