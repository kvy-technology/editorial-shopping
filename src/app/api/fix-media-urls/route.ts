import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not set' }, { status: 500 })
  }

  try {
    const payload = await getPayload({ config })

    // List all blobs in the store
    const blobList = await list({ token: process.env.BLOB_READ_WRITE_TOKEN })
    const blobsByName: Record<string, string> = {}
    for (const blob of blobList.blobs) {
      blobsByName[blob.pathname] = blob.url
    }

    // Get all media documents
    const { docs: allMedia } = await payload.find({
      collection: 'media',
      limit: 500,
      depth: 0,
    })

    let updated = 0
    for (const doc of allMedia) {
      const updates: Record<string, any> = {}
      const filename = (doc as any).filename

      // Fix main URL
      if (filename && blobsByName[filename]) {
        updates.url = blobsByName[filename]
      }

      // Fix size URLs (thumbnail, card, hero)
      for (const size of ['thumbnail', 'card', 'hero']) {
        const sizeFilename = (doc as any)[`sizes_${size}_filename`] || (doc as any).sizes?.[size]?.filename
        if (sizeFilename && blobsByName[sizeFilename]) {
          updates[`sizes_${size}_url`] = blobsByName[sizeFilename]
        }
      }

      if (Object.keys(updates).length > 0) {
        await payload.update({
          collection: 'media',
          id: doc.id,
          data: updates,
        })
        updated++
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Updated ${updated} media documents`,
      totalMedia: allMedia.length,
      totalBlobs: blobList.blobs.length,
    })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
