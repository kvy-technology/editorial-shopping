import type { Block } from 'payload'

export const StylingTipBlock: Block = {
  slug: 'stylingTip',
  labels: {
    singular: 'Styling Tip',
    plural: 'Styling Tips',
  },
  fields: [
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Emoji or icon character e.g. 💡',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Bold label e.g. The 60-30-10 rule',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
}
