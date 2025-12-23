// apps/web/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // المسارات التي تتطلب مصادقة المدير
  const adminPaths = ['/admin', '/admin/dashboard', '/admin/users']
  
  // إذا كان المسار يبدأ بـ /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // استثناء صفحة تسجيل الدخول
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // الحصول على التوكن من الكوكيز
    const token = request.cookies.get('admin_token')?.value
    
    if (!token) {
      // إعادة التوجيه إلى صفحة تسجيل الدخول
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    try {
      // التحقق من صحة التوكن
      const verifyResponse = await fetch(`${request.nextUrl.origin}/api/admin/login`, {
        headers: {
          'Cookie': `admin_token=${token}`
        }
      })
      
      if (!verifyResponse.ok) {
        // حذف الكوكيز غير الصالحة وإعادة التوجيه
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('admin_token')
        response.cookies.delete('admin_user')
        return response
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// تحديد المسارات التي سيتم تطبيق الـ Middleware عليها
export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}