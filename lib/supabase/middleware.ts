// import { createServerClient } from '@supabase/ssr';
// //import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// import { NextResponse, type NextRequest } from 'next/server';

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll: () => request.cookies.getAll(),
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
//           supabaseResponse = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (
//     !user &&
//     !request.nextUrl.pathname.startsWith('/login') &&
//     !request.nextUrl.pathname.startsWith('/auth') &&
//     !request.nextUrl.pathname.startsWith('/register') &&
//     !request.nextUrl.pathname.startsWith('/forgot-password')
//   ) {
//     const url = request.nextUrl.clone();
//     url.pathname = '/login';
//     return NextResponse.redirect(url);
//   }

//   return supabaseResponse;
// } 

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createMiddlewareClient({ req: request, res: response });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect private routes from unauthenticated access
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/forgot-password')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
}
