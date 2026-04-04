import type { Block } from 'payload'

export const SectionHeadingBlock: Block = {
  slug: 'sectionHeading',
  labels: {
    singular: 'Section Heading',
    plural: 'Section Headings',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'number',
          type: 'text',
          admin: {
            description: 'Optional number prefix e.g. 01',
            width: '20%',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          admin: {
            width: '80%',
          },
        },
      ],
    },
  ],
}
