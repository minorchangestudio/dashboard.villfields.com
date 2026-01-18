import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { code } = await params

  console.log('[Next.js UTM Redirect] Received request for code:', code)

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

    console.log('[Next.js UTM Redirect] Client IP extraction:', {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIp,
      'cf-connecting-ip': cfConnectingIp,
      extracted_ip: clientIp,
      all_headers: Object.fromEntries(request.headers.entries())
    })

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
      
      console.log('[Next.js UTM Redirect] Setting real client IP header:', clientIp)
    }

    console.log('[Next.js UTM Redirect] Forwarding headers to backend:', forwardedHeaders)
    console.log('[Next.js UTM Redirect] Calling backend URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects, we'll handle it
      headers: forwardedHeaders,
      // Cache settings - you might want to adjust these
      cache: 'no-store',
    })

    console.log('[Next.js UTM Redirect] Backend response status:', response.status)

    // Check if it's a redirect response (302, 301, etc.)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      console.log('[Next.js UTM Redirect] Redirect location:', location)
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
    console.error('[Next.js UTM Redirect] Error:', error)
    console.error('[Next.js UTM Redirect] Error stack:', error.stack)
    return NextResponse.json(
      { message: 'Error processing redirect', error: error.message },
      { status: 500 }
    )
  }
}
