import { Checkbox, Label } from "@modules/common/components/ui"
import React, { useId } from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  id?: string
  "data-testid"?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  id,
  "data-testid": dataTestId,
}) => {
  const generatedId = useId()
  const inputId = id ?? `checkbox-${generatedId}`

  return (
    <div className="flex items-center space-x-2 ">
      <Checkbox
        className="text-base-regular flex items-center gap-x-2"
        id={inputId}
        role="checkbox"
        checked={checked}
        readOnly
        aria-checked={checked}
        onClick={onChange}
        name={name}
        data-testid={dataTestId}
      />
      <Label htmlFor={inputId} className="!transform-none !txt-medium">
        {label}
      </Label>
    </div>
  )
}

export default CheckboxWithLabel
