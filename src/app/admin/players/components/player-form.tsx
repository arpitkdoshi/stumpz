'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getDirtyValues } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TSinglePlayer } from '@/lib/types'
import { playerRoleVal, tShirtSizeVal } from '@/db/schema'
import { createPlayer, updatePlayer } from '@/actions/player'
import { useLoading } from '@/context/loading-context'
import { toast } from 'sonner'
import { UploadSingleFile } from '@/components/file-upload'
import { useAdminStore } from '@/providers/admin-store-provider'

const formSchema = z.object({
  img_url: z.string(),
  name: z.string().min(1, { error: 'Player name is required' }),
  tShirtSize: z.string(),
  role: z.string(),
  basePrice: z.number(),
  group: z.string(),
})

export default function PlayerForm({
  player,
  updateUIPlayerAction,
  onCancelAction,
}: {
  player: Partial<TSinglePlayer> | null
  updateUIPlayerAction: (id: string, isNew: boolean) => void
  onCancelAction: () => void
}) {
  const { setLoading } = useLoading()
  const { selectedTournamentId } = useAdminStore(store => store)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      img_url: player && player.img_url ? player.img_url : '',
      name: player && player.name ? player.name : '',
      tShirtSize: player && player.tShirtSize ? player.tShirtSize : 'L',
      role: player && player.role ? player.role : 'Batsman',
      basePrice: player && player.basePrice ? player.basePrice : 2000,
      group: player && player.group ? player.group : '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    if (player && 'id' in player && player.id !== '') {
      const d = getDirtyValues(form.formState.dirtyFields, form.getValues())
      const v = { ...d } as Partial<TSinglePlayer>
      const resp = await updatePlayer({ id: player.id, ...v })
      if (resp.success) {
        toast.success('Player details saved!')
        updateUIPlayerAction(player.id!, false)
      } else {
        toast.error('Something wen wrong, unable to update the player details')
      }
    } else {
      if (selectedTournamentId && selectedTournamentId !== '') {
        const v = values as Partial<TSinglePlayer>
        v['tournamentId'] = selectedTournamentId
        const resp = await createPlayer({ ...v })
        if (resp.success) {
          const id = resp.data as string
          updateUIPlayerAction(id, true)
          toast.success('Player created successfully!')
        } else {
          toast.error('Something went wrong, unable to create the player')
        }
      }
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <div className={'hidden'}>
        {JSON.stringify(form.formState.dirtyFields, null, 2)}
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8 mx-auto py-4'
      >
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 lg:col-span-6'>
            <FormField
              control={form.control}
              name='img_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <div className='h-fit'>
                      <UploadSingleFile
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                        maxSize={10 * 1024 * 1024}
                        currentImg={field.value}
                        cropShape={'circle'}
                        onImgChangeAction={field.onChange}
                      >
                        <div className='flex flex-col gap-1 font-semibold'>
                          <p>Player Logo</p>
                          <p className='text-xs text-muted-foreground'>
                            Please select an image smaller than 10MB
                          </p>
                        </div>
                      </UploadSingleFile>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Player Name' type='text' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name='basePrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Base Price'
                      type='number'
                      {...field}
                      onChange={event => {
                        // Manually convert the string value to a number
                        field.onChange(parseInt(event.target.value || '0'))
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={'w-full'}>
                          <SelectValue placeholder='Player Role' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {playerRoleVal.map(s => (
                          <SelectItem value={s} key={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name='tShirtSize'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>T-Shirt size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={'w-full'}>
                          <SelectValue placeholder='T-shirt size' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tShirtSizeVal.map(s => (
                          <SelectItem value={s} key={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name='group'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={'w-full'}>
                          <SelectValue placeholder='Player Group' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                          <SelectItem value={s} key={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        </div>
        <div className='flex justify-end gap-2 item-center'>
          <Button type={'button'} variant={'outline'} onClick={onCancelAction}>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </div>
      </form>
    </Form>
  )
}
