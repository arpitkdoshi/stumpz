import { ChangeEvent, useEffect, useRef, useState } from 'react'
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  Crop,
  makeAspectCrop,
} from 'react-image-crop'
import { createImageFile } from '@/actions/server-actions'
import 'react-image-crop/dist/ReactCrop.css'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const ASPECT_RATIO = 1
const ASPECT_RATIO_RECT = 16 / 9
const MIN_DIMENSION = 150

const setCanvasPreview = (
  image: HTMLImageElement, // HTMLImageElement
  canvas: HTMLCanvasElement, // HTMLCanvasElement
  crop: Crop, // PixelCrop
) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('No 2d context')
  }

  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'
  ctx.save()

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  // Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()
}

const ImageCropper = ({
  file,
  isOpen,
  setIsOpen,
  imgUrl,
  setImgUrl,
  cropShape,
}: {
  file: File | null
  isOpen: boolean
  imgUrl: string
  setImgUrl: (url: string) => void
  setIsOpen: (b: boolean) => void
  cropShape: 'circle' | 'rect'
}) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop | undefined>(undefined)
  const [error, setError] = useState('')

  useEffect(() => {
    onSelectFile(file)
  }, [file])

  const onSelectFile = (file: File | null) => {
    if (!file) return

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      const imageElement = new Image()
      const imageUrl = reader.result?.toString() || ''
      imageElement.src = imageUrl

      imageElement.addEventListener('load', e => {
        if (error) setError('')
        if (e.currentTarget) {
          const { naturalWidth, naturalHeight } =
            e.currentTarget as HTMLImageElement
          if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
            setError('Image must be at least 150 x 150 pixels.')
            return setImgSrc('')
          }
        }
      })
      setImgSrc(imageUrl)
    })
    reader.readAsDataURL(file)
  }

  const onImageLoad = (e: ChangeEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100

    const crop = makeAspectCrop(
      {
        unit: '%',
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height,
    )
    const centeredCrop = centerCrop(crop, width, height)
    setCrop(centeredCrop)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogTitle>Image Cropper</DialogTitle>
        {error && <p className='text-red-400 text-xs'>{error}</p>}
        {imgSrc && (
          <div className='flex flex-col items-center'>
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              keepSelection
              circularCrop={cropShape === 'circle'}
              aspect={cropShape === 'circle' ? ASPECT_RATIO : ASPECT_RATIO_RECT}
              minWidth={MIN_DIMENSION}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt='Upload'
                style={{ maxHeight: '70vh' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <button
              className='text-white font-mono text-xs py-2 px-4 rounded-2xl mt-4 bg-sky-500 hover:bg-sky-600'
              onClick={async () => {
                setCanvasPreview(
                  imgRef.current!, // HTMLImageElement
                  previewCanvasRef.current!, // HTMLCanvasElement
                  convertToPixelCrop(
                    crop!,
                    imgRef.current!.width,
                    imgRef.current!.height,
                  ),
                )
                const dataUrl = previewCanvasRef.current!.toDataURL()
                const url = await createImageFile(dataUrl, imgUrl)
                setImgUrl(url)
                setIsOpen(false)
              }}
            >
              Crop Image
            </button>
          </div>
        )}
        {crop && (
          <canvas
            ref={previewCanvasRef}
            className='mt-4'
            style={{
              display: 'none',
              border: '1px solid black',
              objectFit: 'contain',
              borderRadius: cropShape === 'circle' ? '50%' : '0',
              width: cropShape === 'circle' ? 150 : '100%',
              height: cropShape === 'circle' ? 150 : '50%',
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
export default ImageCropper
