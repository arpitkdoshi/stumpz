import { useEffect, useState } from 'react'

import { Check, ChevronsUpDown, CirclePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ComboboxOptions = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOptions[]
  selected: ComboboxOptions['value']
  className?: string
  placeholder?: string
  disalbed?: boolean
  onChange: (option: ComboboxOptions) => void
  onCreate?: (label: ComboboxOptions['label']) => void
}

function CommandAddItem({
  query,
  onCreate,
}: {
  query: string
  onCreate: () => void
}) {
  return (
    <div
      tabIndex={0}
      onClick={onCreate}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
          onCreate()
        }
      }}
      className={cn(
        'flex w-full text-blue-500 cursor-pointer text-sm px-2 py-1.5 rounded-sm items-center focus:outline-none',
        'hover:bg-blue-200 focus:!bg-blue-200',
      )}
    >
      <CirclePlus className='mr-2 h-4 w-4' />
      Create &#34;{query}&#34;
    </div>
  )
}

export function Combobox({
  options,
  selected,
  className,
  placeholder,
  disalbed,
  onChange,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const [canCreate, setCanCreate] = useState(true)
  useEffect(() => {
    const isAlreadyCreated = !options.some(option => option.label === query)
    setCanCreate(!!(query && isAlreadyCreated))
  }, [query, options])

  function handleSelect(option: ComboboxOptions) {
    if (onChange) {
      onChange(option)
      setOpen(false)
      setQuery('')
    }
  }

  function handleCreate() {
    if (onCreate && query) {
      onCreate(query)
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          disabled={disalbed ?? false}
          aria-expanded={open}
          className={cn(
            'w-full font-normal',
            className,
            selected.length === 0
              ? 'border-dashed border-red-500 bg-red-200/20'
              : '',
          )}
        >
          {selected && selected.length > 0 ? (
            <div className='truncate mr-auto'>
              {options.find(item => item.value === selected)?.label}
            </div>
          ) : (
            <div className='text-slate-600 mr-auto'>
              {placeholder ?? 'Select'}
            </div>
          )}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-fit min-w-[280px] p-0' align={'start'}>
        <Command
          filter={(value, search) => {
            const v = value.toLocaleLowerCase()
            const s = search.toLocaleLowerCase()
            if (v.includes(s)) return 1
            return 0
          }}
        >
          <CommandInput
            placeholder='Search or create new'
            value={query}
            onValueChange={(value: string) => setQuery(value)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault()
              }
            }}
          />
          <CommandEmpty className='flex pl-1 py-1 w-full'>
            {query && (
              <CommandAddItem query={query} onCreate={() => handleCreate()} />
            )}
          </CommandEmpty>

          <CommandList>
            <CommandGroup className='overflow-y-auto'>
              {/* No options and no query */}
              {options.length === 0 && !query && (
                <div className='py-1.5 pl-8 space-y-1 text-sm'>
                  <p>No items</p>
                  <p>Enter a value to create a new one</p>
                </div>
              )}

              {/* Create */}
              {canCreate && (
                <CommandAddItem query={query} onCreate={() => handleCreate()} />
              )}

              {/* Select */}
              {options.map((option, index) => (
                <CommandItem
                  key={option.label}
                  tabIndex={0}
                  value={option.label}
                  onSelect={() => {
                    handleSelect(option)
                  }}
                  onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === 'Enter') {
                      event.stopPropagation()

                      handleSelect(option)
                    }
                  }}
                  className={cn(
                    'cursor-pointer',
                    // Override CommandItem class name
                    'focus:!bg-blue-200 hover:!bg-blue-200 aria-selected:bg-transparent',
                  )}
                >
                  {/* min to avoid the check icon being too small when the option.label is long. */}
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 min-h-4 min-w-4',
                      selected === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
