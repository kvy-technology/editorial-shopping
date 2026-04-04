import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

// Minimal Lexical JSON → HTML renderer (no extra dependency needed)
function renderNode(node: any): string {
  if (!node) return ''

  switch (node.type) {
    case 'root':
      return node.children?.map(renderNode).join('') || ''
    case 'paragraph':
      return `<p>${node.children?.map(renderNode).join('') || ''}</p>`
    case 'heading': {
      const tag = `h${node.tag?.replace('h', '') || '2'}`
      return `<${tag}>${node.children?.map(renderNode).join('') || ''}</${tag}>`
    }
    case 'list':
      return node.listType === 'bullet'
        ? `<ul>${node.children?.map(renderNode).join('') || ''}</ul>`
        : `<ol>${node.children?.map(renderNode).join('') || ''}</ol>`
    case 'listitem':
      return `<li>${node.children?.map(renderNode).join('') || ''}</li>`
    case 'quote':
      return `<blockquote>${node.children?.map(renderNode).join('') || ''}</blockquote>`
    case 'link': {
      const href = node.fields?.url || '#'
      return `<a href="${href}">${node.children?.map(renderNode).join('') || ''}</a>`
    }
    case 'text': {
      let text = node.text || ''
      if (node.format & 1) text = `<strong>${text}</strong>`
      if (node.format & 2) text = `<em>${text}</em>`
      if (node.format & 8) text = `<u>${text}</u>`
      if (node.format & 16) text = `<s>${text}</s>`
      if (node.format & 32) text = `<code>${text}</code>`
      return text
    }
    case 'linebreak':
      return '<br/>'
    default:
      if (node.children) return node.children.map(renderNode).join('')
      return node.text || ''
  }
}

type Props = {
  content: SerializedEditorState | null | undefined
  className?: string
  dropCap?: boolean
}

export default function RichTextRenderer({ content, className = '', dropCap = false }: Props) {
  if (!content?.root) return null

  const html = renderNode(content.root)

  return (
    <div
      className={`rich-text ${dropCap ? 'drop-cap' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
