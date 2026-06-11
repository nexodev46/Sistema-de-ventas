import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'

interface Props {
  images: string[]
  interval?: number
  opacity?: number
}

const BackgroundRotator: React.FC<Props> = ({ images, interval = 5000, opacity = 0.35 }) => {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)

  useEffect(() => {
    if (!images || images.length === 0) return
    const t = setInterval(() => {
      setPrev(index)
      setIndex((i) => (i + 1) % images.length)
    }, interval)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, interval])

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {images.map((src, i) => {
        const isCurrent = i === index
        const isPrev = i === prev
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("${src}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 900ms ease',
              opacity: isCurrent ? opacity : 0,
            }}
          />
        )
      })}
    </Box>
  )
}

export default BackgroundRotator
