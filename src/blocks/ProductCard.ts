import type { Block } from 'payload'

export const ProductCardBlock: Block = {
  slug: 'productCard',
  labels: {
    singular: 'Product Card',
    plural: 'Product Cards',
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'editorsNote',
      type: 'textarea',
      admin: {
        description: "Editor's personal note about this product",
      },
    },
    {
      name: 'displayStyle',
      type: 'select',
      options: [
        { label: 'Full Card', value: 'full' },
        { label: 'Compact', value: 'compact' },
        { label: 'Inline', value: 'inline' },
      ],
      defaultValue: 'full',
    },
  ],
}
