export type ZalivatorGeneratorId =
  | "name"
  | "mobilePhone"
  | "email"
  | "snils"
  | "city"
  | "organizationName"
  | "inn"
  | "kpp"
  | "position"
  | "uuidV7"

export type ZalivatorGenerateRequest = {
  generator: ZalivatorGeneratorId
  quantity: number
  unique?: boolean
  options?: Record<string, unknown>
}

export type ZalivatorGenerateResponse = {
  kind: "text"
  generator: ZalivatorGeneratorId
  quantity: number
  unique: boolean
  values: string[]
}

export type ZalivatorOptionChoice = {
  value: string
  label: string
}

export type ZalivatorSegmentedOptionField = {
  key: string
  label: string
  control: "segmented"
  options: ZalivatorOptionChoice[]
}

export type ZalivatorTextOptionField = {
  key: string
  label: string
  control: "text"
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
}

export type ZalivatorOptionField =
  | ZalivatorSegmentedOptionField
  | ZalivatorTextOptionField

export type ZalivatorGeneratorMetadata = {
  id: ZalivatorGeneratorId
  label: string
  description: string
  kind: "text"
  supportsUnique: boolean
  optionFields: ZalivatorOptionField[]
}

export type ZalivatorGeneratorsDiscoveryResponse = {
  generateEndpoint: string
  quantity: {
    min: number
    max: number
    presets: number[]
  }
  generators: ZalivatorGeneratorMetadata[]
}

export type ZalivatorGeneratorDefinition = {
  id: ZalivatorGeneratorId
  normalizeOptions: (options?: Record<string, unknown>) => Record<string, unknown>
  generateValue: (options: Record<string, unknown>) => string
}
