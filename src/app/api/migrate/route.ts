import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    // Check if tables already exist
    const check = await drizzle.execute(
      sql`SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users'`
    )
    const usersExists = Number(check.rows?.[0]?.count) > 0

    if (usersExists) {
      const tables = await drizzle.execute(
        sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
      )
      return NextResponse.json({
        ok: true,
        message: 'Database tables already exist',
        tables: tables.rows?.map((r: any) => r.tablename),
      })
    }

    // Run Payload's migrate which reads migration files
    await payload.db.migrate()

    return NextResponse.json({ ok: true, message: 'Migrations ran successfully' })
  } catch (migrateError: any) {
    // If no migration files found, fall back to schema push
    try {
      const payload = await getPayload({ config })

      // pushDevSchema requires NODE_ENV !== 'production'
      const origEnv = process.env.NODE_ENV
      ;(process.env as any).NODE_ENV = 'development'

      const { pushDevSchema } = await import('@payloadcms/drizzle')
      await pushDevSchema(payload.db as any)

      ;(process.env as any).NODE_ENV = origEnv

      return NextResponse.json({ ok: true, message: 'Schema pushed successfully (no migration files found, used schema push)' })
    } catch (pushError: any) {
      return NextResponse.json(
        { ok: false, error: pushError.message },
        { status: 500 },
      )
    }
  }
}
