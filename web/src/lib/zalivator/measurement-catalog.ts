import type { ZalivatorOptionChoice } from "@/lib/zalivator/types"

export const ZALIVATOR_MEASUREMENT_STANDARD_TYPE_ORDER = [
  "length",
  "weight",
  "volume",
  "temperature",
  "speed",
  "frequency",
  "data",
  "area",
  "percent",
] as const

export const ZALIVATOR_MEASUREMENT_CUSTOM_TYPE = "custom" as const

export type ZalivatorMeasurementStandardType =
  (typeof ZALIVATOR_MEASUREMENT_STANDARD_TYPE_ORDER)[number]

export type ZalivatorMeasurementType =
  | ZalivatorMeasurementStandardType
  | typeof ZALIVATOR_MEASUREMENT_CUSTOM_TYPE

export const ZALIVATOR_MEASUREMENT_TYPES: Record<
  ZalivatorMeasurementStandardType,
  {
    label: string
    subtypes: readonly string[]
  }
> = {
  length: {
    label: "Длина",
    subtypes: ["мм", "см", "м", "км"],
  },
  weight: {
    label: "Вес",
    subtypes: ["мг", "г", "кг", "т"],
  },
  volume: {
    label: "Объём",
    subtypes: ["мл", "л", "м³"],
  },
  temperature: {
    label: "Температура",
    subtypes: ["°C", "°F"],
  },
  speed: {
    label: "Скорость",
    subtypes: ["км/ч", "м/с"],
  },
  frequency: {
    label: "Частота",
    subtypes: ["Гц", "кГц", "МГц", "ГГц"],
  },
  data: {
    label: "Данные",
    subtypes: ["Б", "КБ", "МБ", "ГБ", "ТБ"],
  },
  area: {
    label: "Площадь",
    subtypes: ["мм²", "см²", "м²", "км²"],
  },
  percent: {
    label: "Проценты",
    subtypes: ["%"],
  },
} as const

export function listMeasurementTypeChoices(): ZalivatorOptionChoice[] {
  return [
    ...ZALIVATOR_MEASUREMENT_STANDARD_TYPE_ORDER.map((type) => ({
      value: type,
      label: ZALIVATOR_MEASUREMENT_TYPES[type].label,
    })),
    {
      value: ZALIVATOR_MEASUREMENT_CUSTOM_TYPE,
      label: "Кастомный",
    },
  ]
}

export function getMeasurementSubtypeChoices(
  type: ZalivatorMeasurementStandardType
): ZalivatorOptionChoice[] {
  return ZALIVATOR_MEASUREMENT_TYPES[type].subtypes.map((subtype) => ({
    value: subtype,
    label: subtype,
  }))
}

export function listMeasurementSubtypes(type: ZalivatorMeasurementStandardType) {
  return [...ZALIVATOR_MEASUREMENT_TYPES[type].subtypes]
}
