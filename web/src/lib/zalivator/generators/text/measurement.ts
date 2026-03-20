import {
  ZALIVATOR_MEASUREMENT_CUSTOM_TYPE,
  listMeasurementSubtypes,
} from "@/lib/zalivator/measurement-catalog"
import type { ZalivatorMeasurementOptions } from "@/lib/zalivator/options"
import { pickRandom, randomInt } from "@/lib/zalivator/random"

function formatMeasurementValue(value: number, subtype?: string) {
  if (!subtype) {
    return String(value)
  }

  if (subtype === "%") {
    return `${value}%`
  }

  return `${value} ${subtype}`
}

function resolveMeasurementSubtypes(options: ZalivatorMeasurementOptions) {
  if (options.type === ZALIVATOR_MEASUREMENT_CUSTOM_TYPE) {
    return options.customSubtypes
  }

  if (options.subtypes.length > 0) {
    return options.subtypes
  }

  return listMeasurementSubtypes(options.type)
}

export function generateMeasurement(options: ZalivatorMeasurementOptions) {
  const value = randomInt(options.min, options.max)
  const subtypes = resolveMeasurementSubtypes(options)

  if (subtypes.length === 0) {
    return String(value)
  }

  return formatMeasurementValue(value, pickRandom(subtypes))
}
