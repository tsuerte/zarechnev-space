import {defineField, defineType} from 'sanity'

export const contentImageType = defineType({
  name: 'contentImage',
  title: 'Content Image',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Required for accessibility and SEO.',
      validation: (rule) => rule.required().min(5).max(140),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      validation: (rule) => rule.max(180),
    }),
  ],
})
