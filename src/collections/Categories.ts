import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier e.g. living-room',
      },
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Terracotta', value: 'terracotta' },
        { label: 'Sage', value: 'sage' },
        { label: 'Blue', value: 'blue' },
        { label: 'Sand', value: 'sand' },
      ],
      defaultValue: 'terracotta',
    },
  ],
}
