import { pickRandom } from "@/lib/zalivator/random"
import type {
  ZalivatorNameOptions,
} from "@/lib/zalivator/options"

const FEMALE_FIRST_NAMES = [
  "Анна",
  "Мария",
  "Елена",
  "Ольга",
  "Наталья",
  "Светлана",
  "Дарья",
  "Ирина",
] as const

const MALE_FIRST_NAMES = [
  "Алексей",
  "Дмитрий",
  "Иван",
  "Павел",
  "Сергей",
  "Андрей",
  "Максим",
  "Роман",
] as const

const FEMALE_LAST_NAMES = [
  "Иванова",
  "Петрова",
  "Соколова",
  "Козлова",
  "Смирнова",
  "Новикова",
  "Романова",
  "Васильева",
] as const

const MALE_LAST_NAMES = [
  "Иванов",
  "Петров",
  "Соколов",
  "Козлов",
  "Смирнов",
  "Новиков",
  "Романов",
  "Васильев",
] as const

const FEMALE_PATRONYMICS = [
  "Ивановна",
  "Павловна",
  "Дмитриевна",
  "Алексеевна",
  "Сергеевна",
  "Андреевна",
] as const

const MALE_PATRONYMICS = [
  "Иванович",
  "Павлович",
  "Дмитриевич",
  "Алексеевич",
  "Сергеевич",
  "Андреевич",
] as const

export type ZalivatorNameParts = {
  firstName: string
  lastName: string
  patronymic: string
}

export function createRandomNameParts(gender: ZalivatorNameOptions["gender"]): ZalivatorNameParts {
  const isFemale = gender === "female" || (gender === "any" && Math.random() >= 0.5)

  if (isFemale) {
    return {
      firstName: pickRandom([...FEMALE_FIRST_NAMES]),
      lastName: pickRandom([...FEMALE_LAST_NAMES]),
      patronymic: pickRandom([...FEMALE_PATRONYMICS]),
    }
  }

  return {
    firstName: pickRandom([...MALE_FIRST_NAMES]),
    lastName: pickRandom([...MALE_LAST_NAMES]),
    patronymic: pickRandom([...MALE_PATRONYMICS]),
  }
}

export function formatName(parts: ZalivatorNameParts, format: ZalivatorNameOptions["format"]) {
  switch (format) {
    case "surname-initials":
      return `${parts.lastName} ${parts.firstName[0]}. ${parts.patronymic[0]}.`
    case "name-surname":
      return `${parts.firstName} ${parts.lastName}`
    case "name-only":
      return parts.firstName
    case "full":
    default:
      return `${parts.lastName} ${parts.firstName} ${parts.patronymic}`
  }
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
}

export function transliterateCyrillic(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]/g, "")
}

export function generateName(options: ZalivatorNameOptions) {
  return formatName(createRandomNameParts(options.gender), options.format)
}
