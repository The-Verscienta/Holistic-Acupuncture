import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'condition',
  title: 'Condition',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Condition Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Pain Management', value: 'pain' },
          { title: 'Mental Health', value: 'mental-health' },
          { title: 'Women\'s Health', value: 'womens-health' },
          { title: 'Digestive Health', value: 'digestive' },
          { title: 'Immune & Allergies', value: 'immune' },
          { title: 'Other Conditions', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
      description: 'Brief description for cards and previews',
    }),
    defineField({
      name: 'icon',
      title: 'Icon SVG Path',
      type: 'text',
      rows: 2,
      description: 'SVG path data for the icon (from heroicons or similar)',
    }),
    defineField({
      name: 'detailedDescription',
      title: 'Detailed Description',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
      description: 'Full description of the condition and how acupuncture helps',
    }),
    defineField({
      name: 'symptoms',
      title: 'Common Symptoms',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of common symptoms',
    }),
    defineField({
      name: 'howAcupunctureHelps',
      title: 'How Acupuncture Helps',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),
    defineField({
      name: 'treatmentDuration',
      title: 'Typical Treatment Duration',
      type: 'string',
      description: 'e.g., "6-12 sessions" or "8-10 weeks"',
    }),
    defineField({
      name: 'relatedConditions',
      title: 'Related Conditions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'condition' }] }],
    }),
    defineField({
      name: 'featuredOnHomepage',
      title: 'Featured on Homepage',
      type: 'boolean',
      description: 'Display this condition on the homepage',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which to display (lower numbers first)',
      initialValue: 0,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
});
