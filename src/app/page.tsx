'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [url, setUrl] = useState<string | null>(null)
  return (
    <div>
      {url && (
        <div>
          <p>Uploaded:</p>
          <Image src={url} alt='uploaded' width={200} height={200} />
        </div>
      )}
    </div>
  )
}
