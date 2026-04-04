import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { pushDevSchema } from '@payloadcms/drizzle'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await pushDevSchema(payload.db as any)
    return NextResponse.json({ ok: true, message: 'Database schema pushed successfully' })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
