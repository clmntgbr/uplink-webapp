import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request)
    if ("error" in auth) return auth.error

    const { id } = await params

    const response = await fetch(`${BACKEND_API_URL}/connections/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(auth.token),
    })

    if (!response.ok) {
      return NextResponse.json({ success: false }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json({ success: false }, { status: 500 })
  }
}
