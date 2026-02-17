import {defineField, defineType} from 'sanity'

export const calloutType = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'tone',
      title: 'Tone',
      type: 'string',
      initialValue: 'info',
      options: {
        list: [
          {title: 'Info', value: 'info'},
          {title: 'Success', value: 'success'},
          {title: 'Warning', value: 'warning'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(800),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'text',
      tone: 'tone',
    },
    prepare({title, subtitle, tone}) {
      return {
        title: title || 'Callout',
        subtitle: tone ? `${tone}: ${subtitle || ''}` : subtitle || '',
      }
    },
  },
})
