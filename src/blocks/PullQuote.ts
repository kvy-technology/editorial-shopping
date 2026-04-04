import type { Block } from 'payload'

export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  labels: {
    singular: 'Pull Quote',
    plural: 'Pull Quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
      admin: {
        description: 'Source or author e.g. Sofia Nilsson, Interior editor',
      },
    },
  ],
}
