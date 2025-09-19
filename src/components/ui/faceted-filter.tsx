import * as React from 'react'
import { useEffect, useState } from 'react'
import { Check, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

interface FacetedFilterProps {
  onValueChange: (values: string[]) => void
  values: string[]
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  classNames?: string
  facets: Record<string, number>
}

export function FacetedFilter({
  onValueChange,
  values,
  title,
  options,
  facets,
  classNames,
}: FacetedFilterProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(values)
  useEffect(() => {
    onValueChange(selectedValues)
  }, [selectedValues])
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-9  border-dashed shadow', classNames)}
        >
          <Search />
          <span className={'font-normal text-xs text-muted-foreground'}>
            {title}
          </span>
          {selectedValues?.length > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.length}
              </Badge>
              <div className='hidden gap-1 lg:flex'>
                {selectedValues.length > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  options
                    .filter(option => selectedValues.includes(option.value))
                    .map(option => (
                      <Badge
                        variant='secondary'
                        key={option.value}
                        className='rounded-sm px-1 font-normal'
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected =
                  selectedValues.filter(s => s === option.value).length > 0
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        setSelectedValues(prev => [
                          ...prev.filter(s => s !== option.value),
                        ])
                      } else {
                        setSelectedValues(prev => [option.value, ...prev])
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-[4px] border',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input [&_svg]:invisible',
                      )}
                    >
                      <Check className='text-primary-foreground size-3.5' />
                    </div>
                    {option.icon && (
                      <option.icon className='text-muted-foreground size-4' />
                    )}
                    <span>{option.label}</span>
                    {option.value in facets && (
                      <span className='text-muted-foreground ml-auto flex size-4 items-center justify-center font-mono text-xs'>
                        {facets[option.value]}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setSelectedValues([])}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
