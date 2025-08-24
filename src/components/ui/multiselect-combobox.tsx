import { ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
// Helper: Combobox Option Type
export type ComboOption = { label: string; value: string }

export function MultiSelectComboBox({
  options,
  selected,
  onChange,
}: {
  options: ComboOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const filteredOptions = options.filter(
    o =>
      o.label.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(o.value),
  )

  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-2'>
        {[...selected].slice(0, 2).map(val => (
          <span
            key={val}
            className='flex items-center bg-muted rounded px-2 py-1 text-xs'
          >
            {val}
            <button
              className='ml-1'
              onClick={() => onChange(selected.filter(v => v !== val))}
              type='button'
            >
              <X className='w-3 h-3' />
            </button>
          </span>
        ))}
        {selected.length > 2 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='secondary'
                size={'sm'}
              >{`+${selected.length - 2}`}</Button>
            </PopoverTrigger>
            <PopoverContent className='w-fit'>
              <div className='flex flex-col gap-1'>
                {[...selected].slice(2).map(val => (
                  <span
                    key={val}
                    className='flex items-center justify-between bg-muted rounded px-2 py-1 text-xs'
                  >
                    {val}
                    <button
                      className='ml-1'
                      onClick={() => onChange(selected.filter(v => v !== val))}
                      type='button'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </span>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className='relative'>
        <div className='relative border rounded-md border-input h-9 shadow-xs'>
          <ChevronsUpDown className='absolute inset-y-0 right-0 mt-2.5 stroke-gray-400 size-4 mr-2' />
          <Input
            placeholder='Filter by roles...'
            value={input}
            className={'border-none pr-8 !shadow-none'}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 100)}
          />
        </div>
        {open && filteredOptions.length > 0 && (
          <div className='absolute z-10 mt-1 bg-background border rounded w-full shadow'>
            {filteredOptions.map(option => (
              <div
                key={option.value}
                className='p-2 hover:bg-accent cursor-pointer'
                onMouseDown={e => {
                  e.preventDefault()
                  onChange([...selected, option.value])
                  setInput('')
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
