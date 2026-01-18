import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { code } = await params

  if (!code) {
    return NextResponse.json(
      { message: 'Code parameter is required' },
      { status: 400 }
    )
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL || 'http://localhost:3001'
    const apiUrl = `${backendUrl}/api/v1/utm-links/redirect/${code}`

    // Call backend API to get redirect URL
    // Forward user agent and referer from the original request
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || request.headers.get('referrer') || undefined
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects, we'll handle it
      headers: {
        'Content-Type': 'application/json',
        ...(userAgent && { 'user-agent': userAgent }),
        ...(referer && { 'referer': referer }),
      },
      // Cache settings - you might want to adjust these
      cache: 'no-store',
    })

    // Check if it's a redirect response (302, 301, etc.)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (location) {
        // Redirect to the full URL with UTM parameters
        return NextResponse.redirect(location, 302)
      }
    }

    // Handle error cases
    if (response.status === 404) {
      return NextResponse.json(
        { message: 'UTM link not found' },
        { status: 404 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { message: 'Error processing redirect' },
      { status: response.status || 500 }
    )
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.json(
      { message: 'Error processing redirect', error: error.message },
      { status: 500 }
    )
  }
}
