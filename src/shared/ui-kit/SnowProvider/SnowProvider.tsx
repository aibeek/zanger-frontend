'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Snowfall from 'react-snowfall'

type SnowContextType = {
    snowEnabled: boolean
    toggleSnow: () => void
}

const SnowContext = createContext<SnowContextType | undefined>(undefined)

export const useSnow = () => {
    const ctx = useContext(SnowContext)
    if (!ctx) throw new Error('useSnow must be used within SnowProvider')
    return ctx
}

// SVG снежинки - детальная снежинка с ветвями
const snowflakeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="white" stroke-width="2" stroke-linecap="round" fill="none"><line x1="50" y1="5" x2="50" y2="95"/><line x1="5" y1="50" x2="95" y2="50"/><line x1="18" y1="18" x2="82" y2="82"/><line x1="82" y1="18" x2="18" y2="82"/><line x1="50" y1="20" x2="40" y2="10"/><line x1="50" y1="20" x2="60" y2="10"/><line x1="50" y1="35" x2="42" y2="27"/><line x1="50" y1="35" x2="58" y2="27"/><line x1="50" y1="80" x2="40" y2="90"/><line x1="50" y1="80" x2="60" y2="90"/><line x1="50" y1="65" x2="42" y2="73"/><line x1="50" y1="65" x2="58" y2="73"/><line x1="20" y1="50" x2="10" y2="40"/><line x1="20" y1="50" x2="10" y2="60"/><line x1="35" y1="50" x2="27" y2="42"/><line x1="35" y1="50" x2="27" y2="58"/><line x1="80" y1="50" x2="90" y2="40"/><line x1="80" y1="50" x2="90" y2="60"/><line x1="65" y1="50" x2="73" y2="42"/><line x1="65" y1="50" x2="73" y2="58"/><line x1="28" y1="28" x2="20" y2="22"/><line x1="28" y1="28" x2="22" y2="20"/><line x1="72" y1="72" x2="80" y2="78"/><line x1="72" y1="72" x2="78" y2="80"/><line x1="72" y1="28" x2="80" y2="22"/><line x1="72" y1="28" x2="78" y2="20"/><line x1="28" y1="72" x2="20" y2="78"/><line x1="28" y1="72" x2="22" y2="80"/></g><circle cx="50" cy="50" r="4" fill="white"/></svg>`

export const SnowProvider = ({ children }: { children: React.ReactNode }) => {
    const [snowEnabled, setSnowEnabled] = useState<boolean>(true)
    const [snowflakeImages, setSnowflakeImages] = useState<HTMLImageElement[]>([])
    const toggleSnow = () => setSnowEnabled((v) => !v)

    // Создаём изображения снежинок на клиенте
    useEffect(() => {
        const img = new Image()
        img.src = `data:image/svg+xml,${encodeURIComponent(snowflakeSvg)}`
        img.onload = () => {
            setSnowflakeImages([img])
        }
    }, [])

    return (
        <SnowContext.Provider value={{ snowEnabled, toggleSnow }}>
            {/* global snowfall with fixed full-screen canvas to ensure visibility */}
            {snowEnabled && snowflakeImages.length > 0 && (
                <Snowfall
                    snowflakeCount={100}
                    images={snowflakeImages}
                    radius={[5, 15]}
                    speed={[0.5, 2]}
                    wind={[-0.5, 1]}
                    rotationSpeed={[-1, 1]}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                />
            )}
            {children}
        </SnowContext.Provider>
    )
}
