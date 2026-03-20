import { generateCity } from "@/lib/zalivator/generators/text/city"
import { generateEmail } from "@/lib/zalivator/generators/text/email"
import { generateInn } from "@/lib/zalivator/generators/text/inn"
import { generateKpp } from "@/lib/zalivator/generators/text/kpp"
import { generateMobilePhone } from "@/lib/zalivator/generators/text/mobile-phone"
import { generateName } from "@/lib/zalivator/generators/text/name"
import { generateOrganizationName } from "@/lib/zalivator/generators/text/organization-name"
import { generatePosition } from "@/lib/zalivator/generators/text/position"
import { generateSnils } from "@/lib/zalivator/generators/text/snils"
import { generateUuidV7 } from "@/lib/zalivator/generators/text/uuid-v7"
import {
  normalizeEmailOptions,
  normalizeInnOptions,
  normalizeMobilePhoneOptions,
  normalizeNameOptions,
  normalizePositionOptions,
  type ZalivatorEmailOptions,
  type ZalivatorInnOptions,
  type ZalivatorMobilePhoneOptions,
  type ZalivatorNameOptions,
  type ZalivatorPositionOptions,
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
  organizationName: {
    id: "organizationName",
    normalizeOptions: () => ({}),
    generateValue: () => generateOrganizationName(),
  },
  inn: {
    id: "inn",
    normalizeOptions: normalizeInnOptions,
    generateValue: (options) => generateInn(options as ZalivatorInnOptions),
  },
  kpp: {
    id: "kpp",
    normalizeOptions: () => ({}),
    generateValue: () => generateKpp(),
  },
  position: {
    id: "position",
    normalizeOptions: normalizePositionOptions,
    generateValue: (options) => generatePosition(options as ZalivatorPositionOptions),
  },
  uuidV7: {
    id: "uuidV7",
    normalizeOptions: () => ({}),
    generateValue: () => generateUuidV7(),
  },
}

export function getZalivatorGenerator(id: ZalivatorGeneratorId) {
  return ZALIVATOR_GENERATOR_REGISTRY[id]
}
