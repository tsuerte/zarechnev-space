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
  | "measurement"

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

export type ZalivatorOptionVisibility = {
  key: string
  value: string
}

type ZalivatorBaseOptionField = {
  key: string
  label: string
  visibleWhen?: ZalivatorOptionVisibility
  hiddenWhen?: ZalivatorOptionVisibility
}

export type ZalivatorSegmentedOptionField = {
  key: string
  label: string
  control: "segmented"
  options: ZalivatorOptionChoice[]
} & ZalivatorBaseOptionField

export type ZalivatorRadioOptionField = {
  key: string
  label: string
  control: "radio"
  options: ZalivatorOptionChoice[]
} & ZalivatorBaseOptionField

export type ZalivatorTextOptionField = {
  key: string
  label: string
  control: "text"
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  defaultValue?: string
} & ZalivatorBaseOptionField

export type ZalivatorNumberOptionField = {
  key: string
  label: string
  control: "number"
  placeholder?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: string
} & ZalivatorBaseOptionField

export type ZalivatorSelectOptionField = {
  key: string
  label: string
  control: "select"
  options: ZalivatorOptionChoice[]
} & ZalivatorBaseOptionField

export type ZalivatorCheckboxGroupOptionField = {
  key: string
  label: string
  control: "checkbox-group"
  options?: ZalivatorOptionChoice[]
  optionsByValue?: Record<string, ZalivatorOptionChoice[]>
  dependsOn?: string
  layout?: "grid" | "stacked"
} & ZalivatorBaseOptionField

export type ZalivatorTextareaOptionField = {
  key: string
  label: string
  control: "textarea"
  placeholder?: string
  rows?: number
  defaultValue?: string
} & ZalivatorBaseOptionField

export type ZalivatorOptionField =
  | ZalivatorSegmentedOptionField
  | ZalivatorRadioOptionField
  | ZalivatorTextOptionField
  | ZalivatorNumberOptionField
  | ZalivatorSelectOptionField
  | ZalivatorCheckboxGroupOptionField
  | ZalivatorTextareaOptionField

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
