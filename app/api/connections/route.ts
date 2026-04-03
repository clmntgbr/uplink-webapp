import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request)
    if ("error" in auth) return auth.error

    const payload = await request.json()

    const headers = createAuthHeaders(auth.token)
    headers["Content-Type"] = "application/ld+json"

    const response = await fetch(`${BACKEND_API_URL}/connections`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return NextResponse.json({ success: false }, { status: response.status })
    }

    const data = await response.json().catch(() => null)
    if (data !== null && typeof data === "object") {
      return NextResponse.json(data)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
