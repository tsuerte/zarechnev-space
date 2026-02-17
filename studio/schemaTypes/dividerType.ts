import {defineField, defineType} from 'sanity'

export const dividerType = defineType({
  name: 'divider',
  title: 'Divider',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      initialValue: 'line',
      options: {
        list: [
          {title: 'Line', value: 'line'},
          {title: 'Wide space', value: 'space'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {style: 'style'},
    prepare({style}) {
      return {
        title: style === 'space' ? 'Divider: Wide space' : 'Divider: Line',
      }
    },
  },
})
