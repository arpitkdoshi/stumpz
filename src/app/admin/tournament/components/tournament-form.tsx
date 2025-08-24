'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn, getDirtyValues } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TSingleTournament } from '@/lib/types'
import { powerOverVal } from '@/db/schema'
import { updateTournament } from '@/actions/tournament'
import { useLoading } from '@/context/loading-context'
import { toast } from 'sonner'
import { UploadSingleFile } from '@/components/file-upload'
import { useAdminStore } from '@/providers/admin-store-provider'

const formSchema = z.object({
  logo: z.string(),
  banner: z.string(),
  name: z.string().min(1, { error: 'Tournament name is required' }),
  date: z.date(),
  totalTeams: z.number(),
  playersPerTeam: z.number(),
  numOfOvers: z.number(),
  powerOver: z.string().min(1, { error: 'Select the Power Over Type' }),
  xOver: z.number(),
})

export default function TournamentForm({
  tournament,
}: {
  tournament: TSingleTournament
}) {
  const { setLoading } = useLoading()
  const { updTournament } = useAdminStore(store => store)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: tournament.logo_url ? tournament.logo_url : '',
      banner: tournament.banner_url ? tournament.banner_url : '',
      name: tournament.name ? tournament.name : '',
      date: tournament.date ? new Date(tournament.date) : new Date(),
      totalTeams: tournament.totalTeams ? tournament.totalTeams : 0,
      playersPerTeam: tournament.playersPerTeam ? tournament.playersPerTeam : 0,
      numOfOvers: tournament.numOfOvers ? tournament.numOfOvers : 0,
      powerOver: tournament.powerOver ? tournament.powerOver : '',
      xOver: tournament.xOver ? tournament.xOver : 0,
    },
  })
  // useEffect(() => {
  //   if (tournament) {
  //     form.reset({
  //       logo: tournament.logo_url ? tournament.logo_url : '',
  //       banner: tournament.banner_url ? tournament.banner_url : '',
  //       name: tournament.name,
  //       date: tournament.date ? new Date(tournament.date) : new Date(),
  //       totalTeams: tournament.totalTeams ? tournament.totalTeams : 0,
  //       playersPerTeam: tournament.playersPerTeam
  //         ? tournament.playersPerTeam
  //         : 0,
  //       numOfOvers: tournament.numOfOvers ? tournament.numOfOvers : 0,
  //       powerOver: tournament.powerOver ? tournament.powerOver : '',
  //       xOver: tournament.xOver ? tournament.xOver : 0,
  //     })
  //   }
  // }, [tournament])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // try {
    //   console.log(values)
    //   const v = {
    //     ...values,
    //     dirty: {
    //       ...getDirtyValues(form.formState.dirtyFields, form.getValues()),
    //     },
    //   }
    //   toast(
    //     <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
    //       <code className='text-white'>{JSON.stringify(v, null, 2)}</code>
    //     </pre>,
    //   )
    // } catch (error) {
    //   console.error('Form submission error', error)
    //   toast.error('Failed to submit the form. Please try again.')
    // }
    setLoading(true)
    const d = getDirtyValues(form.formState.dirtyFields, form.getValues())
    const { name, logo, banner, ...rest } = d
    const v = { ...rest } as Partial<TSingleTournament>
    if (logo) v['logo_url'] = logo
    if (banner) v['banner_url'] = banner
    if (name) {
      updTournament(name, tournament.id)
      v['name'] = name
    }
    const resp = await updateTournament({ id: tournament.id, ...v })
    if (resp.success) {
      toast.success('Tournament settings saved!')
    } else {
      toast.error('Something wen wrong, unable to update the settings')
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
              name='logo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
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
                          <p>Tournament Logo</p>
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

          <div className='col-span-12 lg:col-span-6'>
            <FormField
              control={form.control}
              name='banner'
              render={({ field }) => (
                <FormItem className={'w-full'}>
                  <FormLabel>Banner</FormLabel>
                  <FormControl className={'w-full'}>
                    <UploadSingleFile
                      accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                      maxSize={10 * 1024 * 1024}
                      currentImg={field.value}
                      onImgChangeAction={field.onChange}
                      cropShape={'rect'}
                    >
                      <div className='flex flex-col gap-1 font-semibold'>
                        <p>Tournament Banner</p>
                        <p className='text-xs text-muted-foreground'>
                          Please select an image smaller than 10MB
                        </p>
                      </div>
                    </UploadSingleFile>
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
                    <Input
                      placeholder='Tournament Name'
                      type='text'
                      {...field}
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
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>

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
              name='totalTeams'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teams</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='No. of Teams'
                      type='number'
                      {...field}
                      onChange={event => {
                        // Manually convert the string value to a number
                        field.onChange(parseInt(event.target.value))
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
              name='playersPerTeam'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Players</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='No. of Players per Team'
                      type='number'
                      {...field}
                      onChange={event => {
                        // Manually convert the string value to a number
                        field.onChange(parseInt(event.target.value))
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
              name='numOfOvers'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. of Overs</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='No. of Overs'
                      type='number'
                      {...field}
                      onChange={event => {
                        // Manually convert the string value to a number
                        field.onChange(parseInt(event.target.value))
                      }}
                    />
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
              name='powerOver'
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Power Over</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={'w-full'}>
                          <SelectValue placeholder='Power Over' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {powerOverVal.map(s => (
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
              name='xOver'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>xOver</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='x Over'
                      type='number'
                      {...field}
                      onChange={event => {
                        // Manually convert the string value to a number
                        field.onChange(parseInt(event.target.value))
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type='submit'>Save</Button>
      </form>
    </Form>
  )
}
