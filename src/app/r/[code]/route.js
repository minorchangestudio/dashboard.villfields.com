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

    // Extract client IP from Next.js request
    // In production, get the real client IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    const clientIp = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || null

    // Call backend API to get redirect URL
    // Forward user agent, referer, and client IP from the original request
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || request.headers.get('referrer') || undefined
    
    // Build headers to forward to backend
    const forwardedHeaders = {
      'Content-Type': 'application/json',
      ...(userAgent && { 'user-agent': userAgent }),
      ...(referer && { 'referer': referer }),
    }

    // Forward client IP to backend
    // Use custom headers that are less likely to be modified by internal proxies
    if (clientIp) {
      // Set custom header with real client IP (most important - won't be overwritten by internal proxy)
      forwardedHeaders['x-client-real-ip'] = clientIp
      
      // Also set x-forwarded-for (may be overwritten by proxy, but we have backup)
      if (forwardedFor) {
        forwardedHeaders['x-forwarded-for'] = `${clientIp}, ${forwardedFor}`
      } else {
        forwardedHeaders['x-forwarded-for'] = clientIp
      }
      // Also set x-real-ip
      forwardedHeaders['x-real-ip'] = clientIp
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects, we'll handle it
      headers: forwardedHeaders,
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
