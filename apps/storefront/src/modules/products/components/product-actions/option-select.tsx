import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-2">
      <label 
        htmlFor={`select-${option.id}`} 
        className="text-sm font-medium text-stone-700"
      >
        Select {title}
      </label>
      <div className="relative w-full" data-testid={dataTestId}>
        <select
          id={`select-${option.id}`}
          value={current ?? ""}
          onChange={(e) => updateOption(option.id, e.target.value)}
          disabled={disabled}
          data-testid="option-select"
          className="w-full h-11 px-4 pr-10 border border-stone-200 bg-stone-50 hover:bg-stone-100/50 text-stone-900 rounded-lg shadow-sm text-sm font-medium appearance-none focus:outline-none focus:border-stone-950 focus:ring-1 focus:ring-stone-950 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            Choose {title.toLowerCase()}...
          </option>
          {filteredOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default OptionSelect

