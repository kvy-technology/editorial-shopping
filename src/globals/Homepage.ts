import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'Site',
    livePreview: {
      url: () =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/preview/homepage`,
    },
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Shop the room. Love the story.',
        },
        {
          name: 'subheading',
          type: 'textarea',
          defaultValue:
            'Discover beautifully styled rooms, then shop every piece that makes them extraordinary.',
        },
        {
          name: 'backgroundImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: 'Explore rooms',
        },
        {
          name: 'ctaArticle',
          type: 'relationship',
          relationTo: 'articles',
          admin: {
            description: 'Article the CTA button links to',
          },
        },
      ],
    },
    {
      name: 'featuredArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: {
        description: 'Articles shown in the Latest Stories grid (up to 6)',
      },
    },
    {
      name: 'shoppableScene',
      type: 'group',
      admin: {
        description: 'The interactive shoppable room on the homepage',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'caption',
          type: 'text',
        },
        {
          name: 'hotspots',
          type: 'array',
          admin: {
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
                  admin: { description: 'Horizontal %', step: 0.1 },
                },
                {
                  name: 'y',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 100,
                  admin: { description: 'Vertical %', step: 0.1 },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'trendingProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: 'Products shown in the Trending Products rail',
      },
    },
  ],
}
