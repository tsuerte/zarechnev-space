import {defineField, defineType} from 'sanity'

const genderOptions = [
  {title: 'Муж', value: 'male'},
  {title: 'Жен', value: 'female'},
]

const sourceOptions = [
  {title: 'Сгенерировал в Freepik', value: 'freepik_ai'},
  {title: 'Unsplash', value: 'unsplash'},
]

function getOptionTitle(
  options: Array<{title: string; value: string}>,
  value: string | undefined
): string {
  return options.find((item) => item.value === value)?.title ?? 'Не указано'
}

export const avatarType = defineType({
  name: 'avatar',
  title: 'Avatar',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Изображение',
      description: 'Готовое квадратное изображение 1:1.',
      type: 'image',
      options: {
        hotspot: false,
      },
      validation: (rule) => rule.required().error('Добавь изображение.'),
    }),
    defineField({
      name: 'alt',
      title: 'Alt',
      description: 'Короткое описание изображения для доступности и SEO.',
      type: 'string',
      validation: (rule) =>
        rule.required().min(3).max(160).error('Заполни alt: от 3 до 160 символов.'),
    }),
    defineField({
      name: 'gender',
      title: 'Пол',
      description: 'Используется как единственный фильтр каталога.',
      type: 'string',
      options: {
        list: genderOptions,
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Выбери пол: Муж или Жен.'),
    }),
    defineField({
      name: 'sourceType',
      title: 'Источник',
      description: 'Откуда взят исходник изображения.',
      type: 'string',
      options: {
        list: sourceOptions,
      },
      validation: (rule) => rule.required().error('Выбери источник.'),
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Ссылка на источник',
      description: 'Для Unsplash: вставь URL из кнопки Share.',
      type: 'url',
      hidden: ({document}) => document?.sourceType !== 'unsplash',
      validation: (rule) =>
        rule.custom((value, context) => {
          const sourceType = (context.document as {sourceType?: string} | undefined)?.sourceType
          if (sourceType === 'unsplash' && !value) {
            return 'Для Unsplash нужно указать ссылку на источник.'
          }

          return true
        }),
    }),
  ],
  orderings: [
    {
      title: 'Сначала новые',
      name: 'createdAtDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      alt: 'alt',
      gender: 'gender',
      sourceType: 'sourceType',
      media: 'image',
    },
    prepare({alt, gender, sourceType, media}) {
      const sourceTitle = getOptionTitle(sourceOptions, sourceType)
      const genderTitle = getOptionTitle(genderOptions, gender)

      return {
        title: alt || 'Avatar',
        subtitle: `${genderTitle} · ${sourceTitle}`,
        media,
      }
    },
  },
})
