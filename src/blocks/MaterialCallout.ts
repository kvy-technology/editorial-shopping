import type { Block } from 'payload'

export const MaterialCalloutBlock: Block = {
  slug: 'materialCallout',
  labels: {
    singular: 'Material Callout',
    plural: 'Material Callouts',
  },
  fields: [
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Emoji e.g. 🪵',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Material name e.g. Solid walnut',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
  ],
}
