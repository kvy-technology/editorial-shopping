import type { Block } from 'payload'

export const BudgetBreakdownBlock: Block = {
  slug: 'budgetBreakdown',
  labels: {
    singular: 'Budget Breakdown',
    plural: 'Budget Breakdowns',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Room breakdown',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          admin: {
            description: 'Link to a product (auto-fills price)',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Override label (optional — defaults to product name)',
          },
        },
        {
          name: 'price',
          type: 'number',
          admin: {
            description: 'Override price (optional — defaults to product price)',
          },
        },
        {
          name: 'color',
          type: 'text',
          admin: {
            description: 'Swatch hex color e.g. #8B7355',
          },
        },
      ],
    },
  ],
}
