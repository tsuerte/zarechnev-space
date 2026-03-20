"use client"

import * as React from "react"

import {
  Field as BaseField,
  FieldContent as BaseFieldContent,
  FieldDescription as BaseFieldDescription,
  FieldError as BaseFieldError,
  FieldGroup as BaseFieldGroup,
  FieldLabel as BaseFieldLabel,
  FieldLegend as BaseFieldLegend,
  FieldSeparator as BaseFieldSeparator,
  FieldSet as BaseFieldSet,
  FieldTitle as BaseFieldTitle,
} from "@/components/ui/field"

function Field(props: React.ComponentProps<typeof BaseField>) {
  return <BaseField {...props} />
}

function FieldContent(props: React.ComponentProps<typeof BaseFieldContent>) {
  return <BaseFieldContent {...props} />
}

function FieldDescription(props: React.ComponentProps<typeof BaseFieldDescription>) {
  return <BaseFieldDescription {...props} />
}

function FieldError(props: React.ComponentProps<typeof BaseFieldError>) {
  return <BaseFieldError {...props} />
}

function FieldGroup(props: React.ComponentProps<typeof BaseFieldGroup>) {
  return <BaseFieldGroup {...props} />
}

function FieldLabel(props: React.ComponentProps<typeof BaseFieldLabel>) {
  return <BaseFieldLabel {...props} />
}

function FieldLegend(props: React.ComponentProps<typeof BaseFieldLegend>) {
  return <BaseFieldLegend {...props} />
}

function FieldSeparator(props: React.ComponentProps<typeof BaseFieldSeparator>) {
  return <BaseFieldSeparator {...props} />
}

function FieldSet(props: React.ComponentProps<typeof BaseFieldSet>) {
  return <BaseFieldSet {...props} />
}

function FieldTitle(props: React.ComponentProps<typeof BaseFieldTitle>) {
  return <BaseFieldTitle {...props} />
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
}
