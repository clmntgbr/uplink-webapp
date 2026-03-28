import { createAuthHeaders } from "@/lib/create-auth-headers"
import { requireAuth } from "@/lib/require-auth"
import { UpdateStepPayload } from "@/lib/step/types"
import { pick } from "lodash"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireAuth(request)
    if ("error" in auth) return auth.error

    const { id } = await params
    const payload = (await request.json()) as UpdateStepPayload

    const response = await fetch(`${BACKEND_API_URL}/steps/${id}`, {
      method: "PUT",
      headers: createAuthHeaders(auth.token),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return NextResponse.json({ success: false }, { status: response.status })
    }

    const data = await response.json()
    const step = pick(data, ["@id", "id", "name", "description"])

    return NextResponse.json(step)
  } catch (error) {
    console.error(error)

    return NextResponse.json({ success: false }, { status: 500 })
  }
}
