import { getPayload } from 'payload'
import config from '@payload-config'
import HomepagePreviewClient from '@/components/preview/HomepagePreviewClient'

export default async function HomepagePreviewPage() {
  const payload = await getPayload({ config })

  const homepageData = await payload
    .findGlobal({ slug: 'homepage', depth: 3 })
    .catch(() => ({}))

  return <HomepagePreviewClient initialData={homepageData} />
}
