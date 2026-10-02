'use client'

import type { LatLng } from './geo'

// The visitor's position for "ใกล้ฉัน" lives only in this tab (sessionStorage),
// rounded to ~100 m. It is sent with nearby requests and never stored server-side.

const KEY = 'sd_near'
const FRESH_MS = 15 * 60 * 1000

export function savedPosition(): LatLng | undefined {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as (LatLng & { at: number }) | null
    return v && Date.now() - v.at < FRESH_MS ? { lat: v.lat, lng: v.lng } : undefined
  } catch {
    return undefined
  }
}

export function clearSavedPosition() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {}
}

export type PositionError = 'unsupported' | 'denied' | 'unavailable'

export function requestPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject('unsupported' satisfies PositionError)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: +pos.coords.latitude.toFixed(3), lng: +pos.coords.longitude.toFixed(3) }
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ ...p, at: Date.now() }))
        } catch {}
        resolve(p)
      },
      (err) =>
        reject((err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable') satisfies PositionError),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60 * 1000 },
    )
  })
}

export const positionErrorText: Record<PositionError, string> = {
  unsupported: 'เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง ลองเลือกย่านเองแทน',
  denied:
    'ยังไม่ได้อนุญาตให้ใช้ตำแหน่ง เปิดสิทธิ์ตำแหน่งให้เว็บนี้ในการตั้งค่าเบราว์เซอร์ หรือเลือกย่านเองแทน',
  unavailable: 'หาตำแหน่งไม่ได้ตอนนี้ ลองอีกครั้ง หรือเลือกย่านเองแทน',
}
