import type { CollectionConfig } from 'payload'
import { RichTextBlock } from '../blocks/RichTextBlock'
import { ShoppableSceneBlock } from '../blocks/ShoppableScene'
import { SectionHeadingBlock } from '../blocks/SectionHeading'
import { ProductCardBlock } from '../blocks/ProductCard'
import { StylingTipBlock } from '../blocks/StylingTip'
import { MaterialCalloutBlock } from '../blocks/MaterialCallout'
import { PullQuoteBlock } from '../blocks/PullQuote'
import { ImagePairBlock } from '../blocks/ImagePair'
import { BudgetBreakdownBlock } from '../blocks/BudgetBreakdown'

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'featured', 'updatedAt'],
    preview: (doc) => `${process.env.NEXT_PUBLIC_SERVER_URL}/articles/${doc.slug}`,
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/preview/articles/${data.id}`,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug e.g. scandinavian-living-room',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short description shown on cards',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'authors',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'readTime',
          type: 'text',
          admin: {
            description: 'e.g. 6 min',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/TagRowLabel#TagRowLabel',
        },
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [
        RichTextBlock,
        ShoppableSceneBlock,
        SectionHeadingBlock,
        ProductCardBlock,
        StylingTipBlock,
        MaterialCalloutBlock,
        PullQuoteBlock,
        ImagePairBlock,
        BudgetBreakdownBlock,
      ],
    },
  ],
}
