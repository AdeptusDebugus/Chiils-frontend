import React, { useEffect, useMemo, useRef, useState } from 'react'
import './TakeATourOverlay.css'

const VIDEO_SRC =
  'https://ietwfbbswfenycwrkuqq.supabase.co/storage/v1/object/public/Demo%20video/Chiils%20grand%20tour.mp4'

type TakeATourOverlayProps = {
  isOpen: boolean
  onClose: () => void
}

const TakeATourOverlay: React.FC<TakeATourOverlayProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const playPauseAlt = useMemo(() => (isPlaying ? 'Pause video' : 'Play video'), [isPlaying])

  useEffect(() => {
    if (!isOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    const maybePlay = async () => {
      const video = videoRef.current
      if (!video) return
      try {
        await video.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    }
    void maybePlay()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
  }, [isOpen])

  const handleOverlayClick = () => onClose()
  const handleContentClick: React.MouseEventHandler<HTMLDivElement> = e => e.stopPropagation()

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused || video.ended) {
      try {
        await video.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="take-a-tour-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Take a tour"
      onClick={handleOverlayClick}
    >
      <div className="take-a-tour-content" onClick={handleContentClick}>
        <video
          ref={videoRef}
          className="take-a-tour-video"
          src={VIDEO_SRC}
          playsInline
          preload="metadata"
          autoPlay
        />

        <button type="button" className="take-a-tour-close" onClick={onClose} aria-label="Close video">
          <img src="/assets/take-a-tour/close-video.svg" alt="" />
        </button>

        <button
          type="button"
          className="take-a-tour-play-pause"
          onClick={togglePlayPause}
          aria-label={playPauseAlt}
        >
          <img src="/assets/take-a-tour/play-pause.svg" alt="" />
        </button>
      </div>
    </div>
  )
}

export default TakeATourOverlay

