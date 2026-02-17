import {defineArrayMember, defineField, defineType} from 'sanity'

export const simpleTableType = defineType({
  name: 'simpleTable',
  title: 'Simple Table',
  type: 'object',
  fields: [
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [defineArrayMember({type: 'tableRow'})],
      validation: (rule) => rule.required().min(2),
    }),
  ],
  preview: {
    select: {
      caption: 'caption',
      rows: 'rows',
    },
    prepare({caption, rows}) {
      const rowCount = Array.isArray(rows) ? rows.length : 0
      return {
        title: caption || 'Simple table',
        subtitle: `${rowCount} row${rowCount === 1 ? '' : 's'}`,
      }
    },
  },
})
