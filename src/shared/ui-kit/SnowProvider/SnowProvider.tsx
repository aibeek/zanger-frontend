'use client'

import React, { createContext, useContext, useState } from 'react'
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

export const SnowProvider = ({ children }: { children: React.ReactNode }) => {
    const [snowEnabled, setSnowEnabled] = useState<boolean>(true)
    const toggleSnow = () => setSnowEnabled((v) => !v)

    return (
        <SnowContext.Provider value={{ snowEnabled, toggleSnow }}>
            {/* global snowfall with fixed full-screen canvas to ensure visibility */}
            {snowEnabled && (
                <Snowfall
                    color="#ffffff"
                    snowflakeCount={150}
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
