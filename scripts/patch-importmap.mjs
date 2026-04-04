/**
 * Patches the Payload importMap to include the Vercel Blob client upload handler.
 * Run this before `next build` to ensure the component is registered.
 */
import fs from 'fs'

const IMPORT_MAP_PATH = 'src/app/(payload)/admin/importMap.js'

let content = fs.readFileSync(IMPORT_MAP_PATH, 'utf-8')

const importLine = `import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_vercel } from '@payloadcms/storage-vercel-blob/client'`
const mapEntry = `  "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler": VercelBlobClientUploadHandler_vercel`

if (!content.includes('VercelBlobClientUploadHandler')) {
  // Add import at the end of imports (before `export const importMap`)
  content = content.replace(
    'export const importMap = {',
    `${importLine}\n\nexport const importMap = {`
  )
  // Add map entry before the closing }
  content = content.replace(
    /\n\}[\s]*$/,
    `,\n${mapEntry}\n}\n`
  )
  fs.writeFileSync(IMPORT_MAP_PATH, content)
  console.log('Patched importMap with VercelBlobClientUploadHandler')
} else {
  console.log('importMap already contains VercelBlobClientUploadHandler')
}
