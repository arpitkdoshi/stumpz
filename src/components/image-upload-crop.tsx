'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from '@/components/ui/shadcn-io/image-crop'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

type CropShape = 'round' | 'square' | 'rectangle'

interface ImageUploadCropProps {
  value?: string | null // input image path (URL or base64)
  onChange: (value: string | null) => void // updated cropped image path callback
  cropShape?: CropShape // default crop shape, default 'square'
}

const AspectRatios = {
  square: 1,
  rectangle: 16 / 9,
}

const ImageUploadCrop: React.FC<ImageUploadCropProps> = ({
  value,
  onChange,
  cropShape = 'square',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)

  // Sync croppedImage state with external value prop (e.g., form reset or initial value)
  useEffect(() => {
    if (value || value === null) {
      setCroppedImage(value)
      setSelectedFile(null)
    }
  }, [value])

  // Called when new file is dropped/selected
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setCroppedImage(null)
      // Clear form field value until crop applied
      onChange(null)
    },
    [onChange],
  )

  // When cropping is applied, update the croppedImage and notify parent via onChange
  const handleCrop = (croppedBase64: string) => {
    setCroppedImage(croppedBase64)
    setSelectedFile(null)
    onChange(croppedBase64)
  }

  // Clear all states and notify parent
  const handleReset = () => {
    setSelectedFile(null)
    setCroppedImage(null)
    onChange(null)
  }

  // Get aspect ratio number for crop component
  const getAspectRatio = () => {
    switch (cropShape) {
      case 'round':
      case 'square':
        return AspectRatios.square
      case 'rectangle':
        return AspectRatios.rectangle
      default:
        return AspectRatios.square
    }
  }

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  // If no file selected and no cropped image, show dropzone
  if (!selectedFile && !croppedImage) {
    return (
      <div className={'w-fit h-git'}>
        <div
          {...getRootProps()}
          style={{
            borderRadius: cropShape === 'round' ? '50%' : '0',
            height: cropShape === 'rectangle' ? 180 : 200,
            width: cropShape === 'rectangle' ? 320 : 200,
          }}
          className={`border flex justify-center items-center border-dashed rounded p-6 text-center cursor-pointer ${
            isDragActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className={'text-xs'}>Drop the image here...</p>
          ) : (
            <p className={'text-xs'}>
              Drag & drop an image here, or click to select
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show cropped image preview with reset option
  if (croppedImage && !selectedFile) {
    if (value !== null && value !== '') {
      return (
        <div
          className='text-center'
          style={{
            borderRadius: cropShape === 'round' ? '50%' : '0',
            height: cropShape === 'rectangle' ? 180 : 200,
            width: cropShape === 'rectangle' ? 320 : 200,
          }}
        >
          <div className='group relative' {...getRootProps()}>
            <input {...getInputProps()} />
            <Image
              src={croppedImage}
              alt='Cropped'
              width={cropShape === 'rectangle' ? 320 : 200}
              height={cropShape === 'rectangle' ? 180 : 200}
              style={{ borderRadius: cropShape === 'round' ? '50%' : '0' }}
              className='mx-auto'
            />
            <div
              style={{
                borderRadius: cropShape === 'round' ? '50%' : '0',
                height: cropShape === 'rectangle' ? 180 : 200,
                width: cropShape === 'rectangle' ? 320 : 200,
              }}
              className='absolute hidden group-hover:flex justify-center items-center blur-md bg-black/20 top-0 left-0'
            ></div>
            <div className='absolute hidden group-hover:flex justify-center items-center w-full h-full top-0 left-0'>
              <Pencil className={'stroke-white'} />
            </div>
          </div>
          <div className='flex justify-center items-center gap-4 mt-4'>
            <Button variant='outline' onClick={handleReset}>
              Remove Image
            </Button>
          </div>
        </div>
      )
    }
    return (
      <div className='text-center'>
        <Image
          src={croppedImage}
          alt='Cropped'
          width={cropShape === 'rectangle' ? 320 : 200}
          height={cropShape === 'rectangle' ? 180 : 200}
          style={{ borderRadius: cropShape === 'round' ? '50%' : '0' }}
          className='mx-auto'
        />
        <div className='flex justify-center items-center gap-4 mt-4'>
          <Button variant='outline' onClick={handleReset}>
            Remove Image
          </Button>
        </div>
      </div>
    )
  }

  // Otherwise, show cropper UI for selected file
  return (
    <div>
      <ImageCrop
        file={selectedFile!}
        aspect={getAspectRatio()}
        circularCrop={cropShape === 'round'}
        onCrop={handleCrop}
      >
        <ImageCropContent />
        <ImageCropApply />
        <ImageCropReset />
        <div className='mt-2 flex justify-between'>
          <Button variant='outline' onClick={handleReset}>
            Cancel
          </Button>
        </div>
      </ImageCrop>
    </div>
  )
}

export default ImageUploadCrop
