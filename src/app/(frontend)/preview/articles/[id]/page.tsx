import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import ArticlePreviewClient from '@/components/preview/ArticlePreviewClient'

type Props = { params: Promise<{ id: string }> }

export default async function ArticlePreviewPage({ params }: Props) {
  const { id } = await params
  const payload = await getPayload({ config })

  const article = await payload
    .findByID({ collection: 'articles', id, depth: 3 })
    .catch(() => null)

  if (!article) notFound()

  return <ArticlePreviewClient initialData={article} />
}
