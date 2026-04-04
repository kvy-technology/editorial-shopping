import type { Block } from 'payload'

export const ImagePairBlock: Block = {
  slug: 'imagePair',
  labels: {
    singular: 'Image Pair',
    plural: 'Image Pairs',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'imageOne',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'imageTwo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
