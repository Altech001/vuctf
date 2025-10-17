"use client"

import { useState, useEffect } from "react"

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: { code: number; message: string } | null
  loading: boolean
}

export function useGeolocation(options: GeolocationOptions = {}): GeolocationState {
  const { enableHighAccuracy = false, timeout = 5000, maximumAge = 0, watch = false } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: { code: 0, message: "Geolocation is not supported by your browser" },
        loading: false,
      })
      return
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const onError = (error: GeolocationPositionError) => {
      setState({
        latitude: null,
        longitude: null,
        error: { code: error.code, message: error.message },
        loading: false,
      })
    }

    const geo = navigator.geolocation
    const geoOptions = { enableHighAccuracy, timeout, maximumAge }

    if (watch) {
      const watchId = geo.watchPosition(onSuccess, onError, geoOptions)
      return () => geo.clearWatch(watchId)
    } else {
      geo.getCurrentPosition(onSuccess, onError, geoOptions)
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch])

  return state
}
