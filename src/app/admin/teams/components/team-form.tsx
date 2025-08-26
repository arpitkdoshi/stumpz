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
import { TSingleTeam } from '@/lib/types'
import { createTeam, updateTeam } from '@/actions/team'
import { useLoading } from '@/context/loading-context'
import { toast } from 'sonner'
import { UploadSingleFile } from '@/components/file-upload'
import { useAdminStore } from '@/providers/admin-store-provider'
import { AdvancedColorPicker } from '@/components/ui/color-picker'

const formSchema = z.object({
  name: z.string().min(1, { error: 'Team name is required' }),
  logo_url: z.string(),
  tShirtColor: z.string(),
  ownerName: z.string(),
})

export default function TeamForm({
  team,
  updateUITeamAction,
  onCancelAction,
}: {
  team: Partial<TSingleTeam> | null
  updateUITeamAction: (id: string, isNew: boolean) => void
  onCancelAction: () => void
}) {
  const { setLoading } = useLoading()
  const { selectedTournamentId } = useAdminStore(store => store)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team && team.name ? team.name : '',
      logo_url: team && team.logo_url ? team.logo_url : '',
      tShirtColor: team && team.tShirtColor ? team.tShirtColor : '',
      ownerName: team && team.ownerName ? team.ownerName : '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    if (team && 'id' in team && team.id !== '') {
      const d = getDirtyValues(form.formState.dirtyFields, form.getValues())
      const v = { ...d } as Partial<TSingleTeam>
      const resp = await updateTeam({ id: team.id, ...v })
      if (resp.success) {
        toast.success('Team details saved!')
        updateUITeamAction(team.id!, false)
      } else {
        toast.error('Something wen wrong, unable to update the team details')
      }
    } else {
      if (selectedTournamentId && selectedTournamentId !== '') {
        const v = values as Partial<TSingleTeam>
        v['tournamentId'] = selectedTournamentId
        const resp = await createTeam({ ...v })
        if (resp.success) {
          const id = resp.data as string
          updateUITeamAction(id, true)
          toast.success('Team created successfully!')
        } else {
          toast.error('Something went wrong, unable to create the team')
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
              name='logo_url'
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
                          <p>Team Logo</p>
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
                    <Input placeholder='Team Name' type='text' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name={'tShirtColor'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>T-Shirt Color</FormLabel>
                  {/*<Popover>*/}
                  {/*  <PopoverTrigger asChild>*/}
                  {/*    <button*/}
                  {/*      type='button'*/}
                  {/*      aria-label='Open color picker'*/}
                  {/*      style={{*/}
                  {/*        background: field.value,*/}
                  {/*        width: 32,*/}
                  {/*        height: 32,*/}
                  {/*        borderRadius: 6,*/}
                  {/*        border: '1px solid #ccc',*/}
                  {/*      }}*/}
                  {/*    />*/}
                  {/*  </PopoverTrigger>*/}
                  {/*  <PopoverContent className='w-auto p-4'>*/}
                  {/*    <FormControl>*/}
                  {/*      <ColorPicker*/}
                  {/*        value={field.value}*/}
                  {/*        onChange={field.onChange}*/}
                  {/*        className='max-w-sm'*/}
                  {/*      >*/}
                  {/*        <ColorPickerSelection className={'w-full h-40'} />*/}
                  {/*        <div className='flex items-center gap-4'>*/}
                  {/*          <div className='grid w-full gap-1'>*/}
                  {/*            <ColorPickerHue />*/}
                  {/*            <ColorPickerAlpha />*/}
                  {/*          </div>*/}
                  {/*        </div>*/}
                  {/*        <div className='flex items-center gap-2'>*/}
                  {/*          <ColorPickerOutput />*/}
                  {/*          <ColorPickerFormat />*/}
                  {/*        </div>*/}
                  {/*      </ColorPicker>*/}
                  {/*    </FormControl>*/}
                  {/*  </PopoverContent>*/}
                  {/*</Popover>*/}
                  <AdvancedColorPicker
                    color={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='col-span-12 md:col-span-6 lg:col-span-4'>
            <FormField
              control={form.control}
              name='ownerName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Owner Name' type='text' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
