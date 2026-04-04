import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    // Temporarily override NODE_ENV so pushDevSchema runs
    // (it checks NODE_ENV !== 'production')
    ;(process.env as any).NODE_ENV = 'development'

    const { pushDevSchema } = await import('@payloadcms/drizzle')
    const payload = await getPayload({ config })
    await pushDevSchema(payload.db as any)

    ;(process.env as any).NODE_ENV = 'production'

    return NextResponse.json({ ok: true, message: 'Database schema pushed successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    )
  }
}
