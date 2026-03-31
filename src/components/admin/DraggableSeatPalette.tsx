'use client'

import { useDraggable } from '@dnd-kit/core'
import { SeatType } from '@/types/supabase'
import { CSS } from '@dnd-kit/utilities'

export function DraggablePaletteItem({ type, label, icon }: { type: SeatType, label: string, icon: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${type}`,
        data: { type }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
    }

    const getSeatColor = (t: SeatType) => {
        switch (t) {
            case 'seater': return 'from-slate-700 to-slate-800 border-slate-600'
            case 'sleeper': return 'from-blue-600/30 to-blue-700/20 border-blue-500/50'
            case 'driver': return 'from-amber-600/30 to-amber-700/20 border-amber-500/50'
            default: return 'from-transparent to-transparent border-dashed border-slate-700 bg-white/5'
        }
    }

    return (
        <li 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes}
            className={`
                flex items-center gap-3 p-2 -mx-2 rounded-xl cursor-grab active:cursor-grabbing hover:bg-white/10
                border border-transparent hover:border-white/20 transition-all
            `}
        >
            <div className={`w-8 ${type === 'sleeper' ? 'h-12' : 'h-8'} rounded-lg border-2 ${getSeatColor(type)} bg-gradient-to-br flex items-center justify-center`}>
                {icon}
            </div>
            <span className="text-slate-300 select-none">{label}</span>
        </li>
    )
}
