// Debug script to test authentication state manually
// Run this in browser console to see what's happening

async function debugAuth() {
  console.log('🔍 Debug: Starting authentication state check');

  // Check what cookies exist
  console.log('🍪 Debug: Current cookies:', document.cookie);

  // Make request to /api/auth/me to see response
  try {
    const response = await fetch('/api/auth/me');
    console.log('📡 Debug: /api/auth/me response status:', response.status);

    const data = await response.json();
    console.log('📡 Debug: /api/auth/me response data:', data);

    // Check if authenticated
    const isAuthenticated = !!data.user;
    console.log('✅ Debug: Authenticated:', isAuthenticated);

    return { response, data, isAuthenticated };
  } catch (error) {
    console.error('❌ Debug: Error calling /api/auth/me:', error);
    return { error };
  }
}

// Run the debug function
debugAuth().then(result => {
  console.log('🔍 Debug: Final result:', result);
});
