import {ImageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const contentCarouselItemType = defineType({
  name: 'contentCarouselItem',
  title: 'Carousel Item',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'contentImage',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      alt: 'image.alt',
      media: 'image.asset',
    },
    prepare({alt, media}) {
      return {
        title: alt || 'Carousel item',
        media,
      }
    },
  },
})
