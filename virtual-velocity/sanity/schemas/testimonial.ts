import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Use initials or first name only (e.g., "Sarah M.")',
    }),
    defineField({
      name: 'condition',
      title: 'Condition Treated',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Brief description of what was treated (e.g., "Chronic Migraines")',
    }),
    defineField({
      name: 'quote',
      title: 'Testimonial Quote',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required().min(50).max(500),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5),
      initialValue: 5,
      description: 'Star rating from 1-5',
    }),
    defineField({
      name: 'date',
      title: 'Review Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      description: 'Display this testimonial on the homepage',
      initialValue: false,
    }),
    defineField({
      name: 'verified',
      title: 'Verified Patient',
      type: 'boolean',
      description: 'This is from a verified patient',
      initialValue: true,
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar/Photo',
      type: 'image',
      description: 'Optional patient photo (with permission)',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'author',
      subtitle: 'condition',
      media: 'avatar',
    },
  },
  orderings: [
    {
      title: 'Date, Newest',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Rating, Highest',
      name: 'ratingDesc',
      by: [{ field: 'rating', direction: 'desc' }],
    },
  ],
});
