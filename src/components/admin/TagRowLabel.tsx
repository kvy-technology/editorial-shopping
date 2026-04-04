'use client'

import { useRowLabel } from '@payloadcms/ui'

export function TagRowLabel() {
  const { data, rowNumber } = useRowLabel<{ tag?: string }>()
  return <>{data?.tag || `Tag ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</>
}
