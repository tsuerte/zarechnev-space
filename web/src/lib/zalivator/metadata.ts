import type {
  ZalivatorGeneratorId,
  ZalivatorGeneratorMetadata,
} from "@/lib/zalivator/types"

export const ZALIVATOR_QUANTITY_MIN = 1
export const ZALIVATOR_QUANTITY_MAX = 100
export const ZALIVATOR_QUANTITY_PRESETS = [1, 5, 10] as const

export const ZALIVATOR_GENERATOR_METADATA: Record<
  ZalivatorGeneratorId,
  ZalivatorGeneratorMetadata
> = {
  name: {
    id: "name",
    label: "Имя",
    description: "Русское имя и ФИО в выбранном текстовом формате.",
    kind: "text",
    supportsUnique: true,
    optionFields: [
      {
        key: "format",
        label: "Формат",
        control: "segmented",
        options: [
          { value: "full", label: "Полное" },
          { value: "surname-initials", label: "С инициалами" },
          { value: "name-surname", label: "Имя + фамилия" },
          { value: "name-only", label: "Только имя" },
        ],
      },
      {
        key: "gender",
        label: "Пол",
        control: "segmented",
        options: [
          { value: "any", label: "Любой" },
          { value: "male", label: "Муж." },
          { value: "female", label: "Жен." },
        ],
      },
    ],
  },
  mobilePhone: {
    id: "mobilePhone",
    label: "Моб. телефон",
    description: "Российский мобильный номер в текстовом виде.",
    kind: "text",
    supportsUnique: true,
    optionFields: [
      {
        key: "format",
        label: "Формат",
        control: "segmented",
        options: [
          { value: "pretty", label: "Со скобками" },
          { value: "plain", label: "Сплошной" },
        ],
      },
    ],
  },
  email: {
    id: "email",
    label: "Эл. почта",
    description: "Email-адрес для макетов и прототипов.",
    kind: "text",
    supportsUnique: true,
    optionFields: [
      {
        key: "domain",
        label: "Домен",
        control: "text",
        placeholder: "mail.ru",
        inputMode: "email",
      },
    ],
  },
  snils: {
    id: "snils",
    label: "СНИЛС",
    description: "Страховой номер с корректной контрольной суммой.",
    kind: "text",
    supportsUnique: true,
    optionFields: [],
  },
  city: {
    id: "city",
    label: "Город",
    description: "Один из популярных российских городов.",
    kind: "text",
    supportsUnique: true,
    optionFields: [],
  },
  organizationName: {
    id: "organizationName",
    label: "Название орг.",
    description: "Название организации в коротком текстовом виде.",
    kind: "text",
    supportsUnique: true,
    optionFields: [],
  },
  inn: {
    id: "inn",
    label: "ИНН",
    description: "ИНН физлица или юрлица с корректной контрольной цифрой.",
    kind: "text",
    supportsUnique: true,
    optionFields: [
      {
        key: "kind",
        label: "Тип",
        control: "segmented",
        options: [
          { value: "legal", label: "Юрлицо" },
          { value: "physical", label: "Физлицо" },
        ],
      },
    ],
  },
  kpp: {
    id: "kpp",
    label: "КПП",
    description: "Код причины постановки на учет в текстовом формате.",
    kind: "text",
    supportsUnique: true,
    optionFields: [],
  },
  position: {
    id: "position",
    label: "Должность",
    description: "Должность из выбранного профессионального домена.",
    kind: "text",
    supportsUnique: true,
    optionFields: [
      {
        key: "domain",
        label: "Домен",
        control: "segmented",
        options: [
          { value: "any", label: "Любая" },
          { value: "it", label: "IT" },
          { value: "fintech", label: "Финтех" },
          { value: "construction", label: "Строительство" },
          { value: "retail", label: "Ритейл" },
          { value: "logistics", label: "Логистика" },
        ],
      },
    ],
  },
  uuidV7: {
    id: "uuidV7",
    label: "UUID v7",
    description: "RFC 9562 UUID v7 с Unix timestamp в миллисекундах и time-ordered структурой.",
    kind: "text",
    supportsUnique: false,
    optionFields: [],
  },
}

export function listZalivatorGeneratorMetadata() {
  return Object.values(ZALIVATOR_GENERATOR_METADATA)
}

export function getZalivatorGeneratorMetadata(generator: ZalivatorGeneratorId) {
  return ZALIVATOR_GENERATOR_METADATA[generator]
}
