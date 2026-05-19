"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  startOnView?: boolean
}

export function AnimatedNumber({
  value,
  duration = 2000,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  startOnView = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!startOnView) {
      animateNumber()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
          animateNumber()
        }
      },
      { threshold: 0.1 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [hasStarted, startOnView])

  const animateNumber = () => {
    const startTime = Date.now()
    const startValue = 0

    const updateNumber = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (value - startValue) * easeOutCubic

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(updateNumber)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(updateNumber)
  }

  const formatNumber = (num: number) => {
    return num?.toFixed(decimals) ?? '0.00'
  }

  return (
    <span ref={elementRef} className={cn(className)}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  )
}
