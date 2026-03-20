import { pickRandom } from "@/lib/zalivator/random"
import { createRandomNameParts } from "@/lib/zalivator/generators/text/name"

const LEGAL_FORMS = [
  "ООО",
  "АО",
  "ПАО",
] as const

const ORGANIZATION_CORES = [
  "Старт",
  "Вектор",
  "Сфера",
  "Альянс",
  "Маяк",
  "Горизонт",
  "Профи",
  "Решение",
  "Контур",
  "Ресурс",
  "Партнер",
  "Импульс",
  "Платформа",
  "Магистраль",
  "Орион",
] as const

const ORGANIZATION_SUFFIXES = [
  "Групп",
  "Сервис",
  "Трейд",
  "Логистик",
  "Проект",
  "Инвест",
  "Технологии",
  "Снабжение",
  "Финанс",
  "Системы",
] as const

const ORGANIZATION_NAME_MODES = [
  "legal",
  "entrepreneur",
  "plain",
] as const

function createOrganizationCoreName() {
  const core = pickRandom([...ORGANIZATION_CORES])
  const suffix = pickRandom([...ORGANIZATION_SUFFIXES])

  return `${core}${suffix}`
}

export function generateOrganizationName() {
  const mode = pickRandom([...ORGANIZATION_NAME_MODES])

  if (mode === "entrepreneur") {
    const parts = createRandomNameParts("any")
    return `ИП ${parts.lastName} ${parts.firstName} ${parts.patronymic}`
  }

  const coreName = createOrganizationCoreName()

  if (mode === "plain") {
    return coreName
  }

  const legalForm = pickRandom([...LEGAL_FORMS])

  return `${legalForm} «${coreName}»`
}
