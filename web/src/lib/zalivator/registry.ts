import { generateCity } from "@/lib/zalivator/generators/text/city"
import { generateEmail } from "@/lib/zalivator/generators/text/email"
import { generateMobilePhone } from "@/lib/zalivator/generators/text/mobile-phone"
import { generateName } from "@/lib/zalivator/generators/text/name"
import { generateSnils } from "@/lib/zalivator/generators/text/snils"
import {
  normalizeEmailOptions,
  normalizeMobilePhoneOptions,
  normalizeNameOptions,
  type ZalivatorEmailOptions,
  type ZalivatorMobilePhoneOptions,
  type ZalivatorNameOptions,
} from "@/lib/zalivator/options"
import type {
  ZalivatorGeneratorDefinition,
  ZalivatorGeneratorId,
} from "@/lib/zalivator/types"

export const ZALIVATOR_GENERATOR_REGISTRY: Record<
  ZalivatorGeneratorId,
  ZalivatorGeneratorDefinition
> = {
  name: {
    id: "name",
    normalizeOptions: normalizeNameOptions,
    generateValue: (options) => generateName(options as ZalivatorNameOptions),
  },
  mobilePhone: {
    id: "mobilePhone",
    normalizeOptions: normalizeMobilePhoneOptions,
    generateValue: (options) =>
      generateMobilePhone(options as ZalivatorMobilePhoneOptions),
  },
  email: {
    id: "email",
    normalizeOptions: normalizeEmailOptions,
    generateValue: (options) => generateEmail(options as ZalivatorEmailOptions),
  },
  snils: {
    id: "snils",
    normalizeOptions: () => ({}),
    generateValue: () => generateSnils(),
  },
  city: {
    id: "city",
    normalizeOptions: () => ({}),
    generateValue: () => generateCity(),
  },
}

export function getZalivatorGenerator(id: ZalivatorGeneratorId) {
  return ZALIVATOR_GENERATOR_REGISTRY[id]
}
