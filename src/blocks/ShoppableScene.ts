import type { Block } from 'payload'

export const ShoppableSceneBlock: Block = {
  slug: 'shoppableScene',
  labels: {
    singular: 'Shoppable Scene',
    plural: 'Shoppable Scenes',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Caption shown below the scene image',
      },
    },
    {
      name: 'hotspots',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Click positions on the image (0–100 for both x and y)',
        components: {
          Field: '/components/admin/HotspotEditor#HotspotEditor',
        },
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'x',
              type: 'number',
              required: true,
              min: 0,
              max: 100,
              admin: {
                description: 'Horizontal position %',
                step: 0.1,
              },
            },
            {
              name: 'y',
              type: 'number',
              required: true,
              min: 0,
              max: 100,
              admin: {
                description: 'Vertical position %',
                step: 0.1,
              },
            },
          ],
        },
      ],
    },
  ],
}
