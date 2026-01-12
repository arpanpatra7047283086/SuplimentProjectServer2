"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"

interface ImageMagnifierProps {
  src: string
  alt: string
  width: number
  height: number
  magnifierSize?: number
  zoomLevel?: number
  className?: string
}

export function ImageMagnifier({
  src,
  alt,
  width,
  height,
  magnifierSize = 150,
  zoomLevel = 2.5,
  className = "",
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => setShowMagnifier(true)
  const handleMouseLeave = () => setShowMagnifier(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCursorPosition({ x, y })
    setMagnifierPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className="object-contain w-full h-full"
      />

      {showMagnifier && (
        <div
          className="absolute pointer-events-none border-2 border-primary rounded-full shadow-lg z-50"
          style={{
            width: magnifierSize,
            height: magnifierSize,
            left: cursorPosition.x - magnifierSize / 2,
            top: cursorPosition.y - magnifierSize / 2,
            backgroundImage: `url(${src || "/placeholder.svg"})`,
            backgroundSize: `${width * zoomLevel}px ${height * zoomLevel}px`,
            backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </div>
  )
}
