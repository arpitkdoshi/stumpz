'use client'

import {
  Dropzone,
  DropZoneArea,
  DropzoneMessage,
  DropzoneTrigger,
  useDropzone,
} from '@/components/ui/dropzone'
import { Accept } from 'react-dropzone'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
//import { uploadFile } from '@/db/queries/upload'
import Image from 'next/image'
import ImageCropper from '@/components/image-cropper'
import { cn } from '@/lib/utils'

export function UploadSingleFile({
  currentImg,
  accept,
  maxSize,
  children,
  onImgChangeAction,
  cropShape,
}: {
  currentImg: string
  children: ReactNode
  accept: Accept
  maxSize: number
  onImgChangeAction: (img: string) => void
  cropShape: 'circle' | 'rect'
}) {
  const onDropFile = useCallback(async (acceptedFile: File) => {
    setUploadedState({ flg: true, file: acceptedFile })
    return {
      status: 'success' as const,
      result: '',
    }
  }, [])
  const [uploadState, setUploadedState] = useState<{
    flg: boolean
    file: File | null
  }>({
    flg: false,
    file: null,
  })
  const [imgUrl, setImgUrl] = useState('')
  useEffect(() => {
    setImgUrl(currentImg)
  }, [currentImg])
  useEffect(() => {
    if (imgUrl !== '' && imgUrl !== currentImg) onImgChangeAction(imgUrl)
  }, [imgUrl, currentImg])
  const dropzone = useDropzone({
    onDropFile,
    validation: {
      accept,
      maxSize,
      maxFiles: 1,
    },
    shiftOnMaxFiles: true,
  })

  // const avatarSrc = dropzone.fileStatuses[0]?.result
  // const isPending = dropzone.fileStatuses[0]?.status === 'pending'
  return (
    <>
      <Dropzone {...dropzone}>
        <div className='flex justify-between'>
          <DropzoneMessage />
        </div>
        <DropZoneArea
          className={cn(
            'bg-transparent text-sm',
            cropShape === 'circle'
              ? 'rounded-full size-[200px]'
              : 'w-full h-[200px]',
          )}
        >
          <DropzoneTrigger
            className={cn(
              'group relative bg-transparent',
              cropShape === 'circle'
                ? 'rounded-full size-[200px]'
                : 'w-full h-[200px]',
            )}
          >
            {imgUrl !== '' ? (
              <>
                <div
                  className={cn(
                    'absolute bg-white/95 border border-primary hidden group-hover:flex justify-center items-center text-center text-xs',
                    cropShape === 'circle'
                      ? 'rounded-full size-[200px]'
                      : 'w-full h-[200px] group-hover:rounded-md',
                  )}
                >
                  {children}
                </div>
                <Image
                  src={imgUrl}
                  alt={'Image'}
                  fill
                  objectFit={'cover'}
                  className={cn(
                    'bg-transparent group-hover:opacity-5',
                    cropShape === 'circle' ? 'rounded-full' : 'rounded-md',
                  )}
                />
              </>
            ) : (
              <div
                className={cn(
                  'flex justify-center items-center text-center text-xs',
                  cropShape === 'circle'
                    ? 'rounded-full size-[200px]'
                    : 'w-full h-[200px]',
                )}
              >
                {children}
              </div>
            )}
          </DropzoneTrigger>
        </DropZoneArea>
      </Dropzone>
      <ImageCropper
        file={uploadState.file}
        isOpen={uploadState.flg}
        imgUrl={imgUrl}
        setImgUrl={setImgUrl}
        setIsOpen={isOpen => {
          setUploadedState(prev => ({
            flg: isOpen,
            // When closing the modal, clear the file; when opening, keep existing file
            file: isOpen ? prev.file : null,
          }))
        }}
        cropShape={cropShape}
      />
    </>
  )
}

// {
//   'image/*': ['.png', '.jpg', '.jpeg'],
// }
//  10 * 1024 * 1024
// <Avatar className={cn(isPending && 'animate-pulse')}>
//   <AvatarImage className='object-cover' src={avatarSrc} />
//   <AvatarFallback>JG</AvatarFallback>
// </Avatar>
// <div className='flex flex-col gap-1 font-semibold'>
//   <p>Upload a new avatar</p>
//   <p className='text-xs text-muted-foreground'>
//     Please select an image smaller than 10MB
//   </p>
// </div>
