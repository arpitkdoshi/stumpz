'use client'

import React from 'react'
import ImageUploadCrop from '@/components/image-upload-crop'
import { useAdminStore } from '@/providers/admin-store-provider'

const TournamentPage = () => {
  const { selectedTournament } = useAdminStore(store => store)
  if (selectedTournament === '') {
    return (
      <div
        className={
          'w-full h-full flex justify-center items-center text-2xl font-bold flex-col'
        }
      >
        No Tournament selected.
        <div className={'font-normal text-sm text-muted-foreground'}>
          Select a tournament, to view the details
        </div>
      </div>
    )
  }
  return (
    <div className={' w-full max-w-4xl mx-auto'}>
      <h2 className={'font-bold text-xl mb-4'}>Tournament Settings</h2>
      <ImageUploadCrop cropShape={'round'} onChange={v => console.log(v)} />
      <ImageUploadCrop cropShape={'rectangle'} onChange={v => console.log(v)} />
      <ImageUploadCrop cropShape={'square'} onChange={v => console.log(v)} />
    </div>
  )
}

export default TournamentPage
