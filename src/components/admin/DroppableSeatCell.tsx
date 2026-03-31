'use client'

import { useDroppable } from '@dnd-kit/core'
import { SeatType } from '@/types/supabase'

interface DroppableSeatCellProps {
    id: string
    type: SeatType
    isAisle: boolean
    label: string
    previewMode: boolean
    onClick: () => void
}

export function DroppableSeatCell({ id, type, isAisle, label, previewMode, onClick }: DroppableSeatCellProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
        disabled: previewMode,
    })

    const getSeatColor = (t: SeatType) => {
        switch (t) {
            case 'seater': return 'from-slate-700 to-slate-800 border-slate-600'
            case 'sleeper': return 'from-blue-600/30 to-blue-700/20 border-blue-500/50'
            case 'driver': return 'from-amber-600/30 to-amber-700/20 border-amber-500/50'
            default: return 'from-transparent to-transparent border-dashed border-slate-700'
        }
    }

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={`
                relative rounded-xl flex items-center justify-center font-bold text-xs select-none 
                transition-all duration-200 group
                ${previewMode ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                ${isOver ? 'ring-2 ring-blue-500 scale-105 opacity-80' : ''}
                ${type === 'empty' ? 'bg-white/5 border-2 border-dashed border-white/20 h-14 md:h-16' : `bg-gradient-to-br ${getSeatColor(type)} border-2`}
                ${isAisle && type !== 'empty' ? 'col-span-1 h-14 md:h-16' : ''}
                ${type === 'sleeper' ? 'h-20 md:h-24 row-span-1' : type !== 'empty' ? 'h-14 md:h-16' : ''}
            `}
            title={`Cell ${id} - ${type === 'empty' ? 'Empty Space' : type === 'driver' ? 'Driver Seat' : type === 'sleeper' ? 'Sleeper Berth' : 'Seater Seat'}`}
        >
            {type !== 'empty' && (
                <>
                    <span className={`${type === 'driver' ? 'text-[10px]' : 'text-xs font-bold'}`}>
                        {type === 'driver' ? 'DRIVER' : label}
                    </span>
                    {type === 'sleeper' && (
                        <span className="absolute bottom-1 text-[8px] text-blue-300/50">SLEEPER</span>
                    )}
                </>
            )}
            {type === 'empty' && (
                <span className="text-[10px] text-slate-600">aisle</span>
            )}
            {/* Visual indicator for drag over */}
            {isOver && type === 'empty' && (
                <div className="absolute inset-0 bg-blue-500/10 rounded-xl" />
            )}
        </div>
    )
}
