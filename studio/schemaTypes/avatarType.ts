import {defineField, defineType} from 'sanity'

const kindOptions = [
  {title: 'Человек', value: 'human'},
  {title: 'Объект', value: 'object'},
]

const genderOptions = [
  {title: 'М', value: 'male'},
  {title: 'Ж', value: 'female'},
]

const sourceOptions = [
  {title: 'Нарисовал сам', value: 'self'},
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
      name: 'kind',
      title: 'Тип',
      description: 'Кто изображён: человек или объект.',
      type: 'string',
      options: {
        list: kindOptions,
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Выбери тип: человек или объект.'),
      initialValue: 'human',
    }),
    defineField({
      name: 'gender',
      title: 'Пол',
      description: 'Указывается только для людей.',
      type: 'string',
      options: {
        list: genderOptions,
        layout: 'radio',
      },
      hidden: ({document}) => document?.kind !== 'human',
      validation: (rule) =>
        rule.custom((value, context) => {
          const kind = (context.document as {kind?: string} | undefined)?.kind
          if (kind === 'human' && !value) {
            return 'Для человека нужно указать пол.'
          }

          return true
        }),
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
      kind: 'kind',
      gender: 'gender',
      sourceType: 'sourceType',
      media: 'image',
    },
    prepare({alt, kind, gender, sourceType, media}) {
      const kindTitle = getOptionTitle(kindOptions, kind)
      const sourceTitle = getOptionTitle(sourceOptions, sourceType)
      const genderTitle = kind === 'human' ? ` · ${getOptionTitle(genderOptions, gender)}` : ''

      return {
        title: alt || 'Avatar',
        subtitle: `${kindTitle}${genderTitle} · ${sourceTitle}`,
        media,
      }
    },
  },
})

