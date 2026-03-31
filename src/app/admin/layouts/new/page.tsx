'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, LayoutGrid, Grid3x3, Layers, Undo2, Redo2, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { SeatType, Seat, Bus } from '@/types/supabase'
import { useQuery } from '@tanstack/react-query'
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { DraggablePaletteItem } from '@/components/admin/DraggableSeatPalette'
import { DroppableSeatCell } from '@/components/admin/DroppableSeatCell'

export default function SeatLayoutDesigner() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [layoutName, setLayoutName] = useState('')
    const [selectedBusId, setSelectedBusId] = useState<string>('none')
    const [rows, setRows] = useState(10)
    const [cols, setCols] = useState(5)
    const [hasUpperDeck, setHasUpperDeck] = useState(false)
    const [previewMode, setPreviewMode] = useState(false)
    const [history, setHistory] = useState<Record<string, SeatType>[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)

    const [gridState, setGridState] = useState<Record<string, SeatType>>({})

    const { data: buses } = useQuery({
        queryKey: ['buses_for_layout'],
        queryFn: async () => {
            const supabase = createClient()
            const { data } = await supabase.from('buses').select('id, name').order('name')
            return (data || []) as Pick<Bus, 'id' | 'name'>[]
        }
    })

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        const draggedType = active.data.current?.type as SeatType
        if (!draggedType) return

        const cellId = over.id as string
        const newState = { ...gridState, [cellId]: draggedType }
        setGridState(newState)
        saveToHistory(newState)
    }

    // Save to history
    const saveToHistory = (newState: Record<string, SeatType>) => {
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push({ ...newState })
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }

    // Undo/Redo
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            setGridState(history[historyIndex - 1])
        }
    }

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            setGridState(history[historyIndex + 1])
        }
    }

    // Initialize/Reset grid
    const initializeGrid = () => {
        const newState: Record<string, SeatType> = {}
        const decks = hasUpperDeck ? ['lower', 'upper'] : ['lower']

        decks.forEach(deck => {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const key = `${deck}-${r}-${c}`
                    // default aisle logic (middle col empty)
                    if (c === Math.floor(cols / 2)) newState[key] = 'empty'
                    else newState[key] = 'seater'
                }
            }
        })
        setGridState(newState)
        saveToHistory(newState)
        toast.success('Grid generated successfully!')
    }

    const toggleSeat = (deck: string, r: number, c: number) => {
        const key = `${deck}-${r}-${c}`
        const current = gridState[key] || 'empty'

        const nextType: Record<SeatType, SeatType> = {
            'seater': 'sleeper',
            'sleeper': 'empty',
            'empty': 'driver',
            'driver': 'seater'
        }

        const newState = { ...gridState, [key]: nextType[current] }
        setGridState(newState)
        saveToHistory(newState)
    }

    const generateSeatLabel = (deck: string, r: number, c: number) => {
        const rowChar = String.fromCharCode(65 + r)
        const deckPrefix = deck === 'upper' ? 'U-' : ''
        return `${deckPrefix}${rowChar}${c + 1}`
    }

    const getSeatColor = (type: SeatType) => {
        switch (type) {
            case 'seater': return 'from-slate-700 to-slate-800 border-slate-600'
            case 'sleeper': return 'from-blue-600/30 to-blue-700/20 border-blue-500/50'
            case 'driver': return 'from-amber-600/30 to-amber-700/20 border-amber-500/50'
            default: return 'from-transparent to-transparent border-dashed border-slate-700'
        }
    }

    const handleSave = async () => {
        if (!layoutName.trim()) { toast.error('Layout name is required'); return }

        setLoading(true)
        try {
            const seats: Seat[] = []

            Object.entries(gridState).forEach(([key, type]) => {
                if (type === 'empty') return

                const [deck, rStr, cStr] = key.split('-')
                const r = parseInt(rStr), c = parseInt(cStr)

                seats.push({
                    id: `${Date.now()}-${key}`,
                    label: generateSeatLabel(deck, r, c),
                    type,
                    row: r,
                    col: c,
                    deck: deck as 'lower' | 'upper'
                })
            })

            const payload = {
                name: layoutName,
                bus_id: selectedBusId === 'none' ? null : selectedBusId,
                is_template: selectedBusId === 'none',
                layout_data: { rows, cols, hasUpperDeck, seats }
            }

            const res = await fetch('/api/admin/seat-layouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body.message || `Failed to save layout (${res.status})`)
            }

            toast.success('Layout saved successfully!')
            router.push('/admin/layouts')
            router.refresh()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save layout')
        } finally {
            setLoading(false)
        }
    }

    const renderDeck = (deck: 'lower' | 'upper') => (
        <div className="relative">
            {/* Deck Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                    <Layers size={18} className="text-blue-400" />
                    {deck} Deck
                </h3>
                <div className="text-xs text-slate-500">
                    {Object.values(gridState).filter((v, i) => {
                        const key = Object.keys(gridState)[i]
                        return key.startsWith(deck) && v !== 'empty'
                    }).length} seats
                </div>
            </div>

            {/* Bus Outline */}
            <div className="relative rounded-2xl border-2 border-white/20 p-4 bg-white/5">
                {/* Front Indicator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                    FRONT
                </div>
                
                {/* Seat Grid */}
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: rows }).map((_, r) =>
                        Array.from({ length: cols }).map((_, c) => {
                            const key = `${deck}-${r}-${c}`
                            const type = gridState[key] || 'empty'
                            const isAisle = c === Math.floor(cols / 2)

                            return (
                                <DroppableSeatCell
                                    key={key}
                                    id={key}
                                    type={type}
                                    isAisle={isAisle}
                                    label={generateSeatLabel(deck, r, c)}
                                    previewMode={previewMode}
                                    onClick={() => !previewMode && toggleSeat(deck, r, c)}
                                />
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )

    const totalSeats = Object.values(gridState).filter(t => t !== 'empty').length

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/layouts" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                            <LayoutGrid className="text-blue-400" size={28} />
                            Seat Layout Designer
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <Sparkles size={14} />
                            Drag seats from the palette onto the grid, or click to toggle.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`p-2 rounded-xl transition-all ${previewMode ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
                        title={previewMode ? 'Exit Preview' : 'Preview Mode'}
                    >
                        {previewMode ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Undo"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Redo"
                    >
                        <Redo2 size={18} />
                    </button>
                    <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Layout'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Controls Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <Grid3x3 size={18} className="text-blue-400" />
                            Configuration
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Layout Name</label>
                                <input 
                                    type="text" 
                                    value={layoutName} 
                                    onChange={(e) => setLayoutName(e.target.value)} 
                                    placeholder="e.g. Standard 40 Seater" 
                                    className="input" 
                                />
                            </div>

                            <div>
                                <label className="label">Assign to Bus (Optional)</label>
                                <select value={selectedBusId} onChange={(e) => setSelectedBusId(e.target.value)} className="input">
                                    <option value="none">Save as Template only</option>
                                    {buses?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Rows</label>
                                    <input type="number" min="5" max="25" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="input" />
                                </div>
                                <div>
                                    <label className="label">Columns</label>
                                    <input type="number" min="3" max="7" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="input" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <input
                                    type="checkbox"
                                    checked={hasUpperDeck}
                                    onChange={(e) => setHasUpperDeck(e.target.checked)}
                                    className="w-5 h-5 rounded border-white/30 text-blue-600 focus:ring-blue-600 bg-white/10"
                                />
                                <span className="text-sm font-medium text-white">Enable Upper Deck</span>
                            </label>

                            <button onClick={initializeGrid} className="btn-secondary w-full flex items-center justify-center gap-2">
                                <LayoutGrid size={16} />
                                Generate Grid
                            </button>

                            {totalSeats > 0 && (
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total Seats:</span>
                                        <span className="text-white font-bold">{totalSeats}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="card">
                        <h3 className="font-bold text-white mb-4">Palette (Drag & Drop)</h3>
                        <ul className="space-y-3">
                            <DraggablePaletteItem type="seater" label="Seater" icon={<span className="text-transparent">S</span>} />
                            <DraggablePaletteItem type="sleeper" label="Sleeper" icon={<span className="text-transparent">Bed</span>} />
                            <DraggablePaletteItem type="driver" label="Driver" icon={<span className="text-[10px] text-amber-500 font-bold">DRV</span>} />
                            <DraggablePaletteItem type="empty" label="Empty / Aisle" icon={<span className="text-slate-500 font-bold text-xs">aisle</span>} />
                        </ul>
                    </div>
                </div>

                {/* Grid Preview */}
                <div className="lg:col-span-3 space-y-6">
                    {Object.keys(gridState).length === 0 ? (
                        <div className="card h-96 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 animate-float">
                                <LayoutGrid size={40} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to Design</h3>
                            <p className="text-slate-400 max-w-sm">
                                Configure your grid dimensions and click &quot;Generate Grid&quot; to start creating your perfect seat layout.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {renderDeck('lower')}
                            {hasUpperDeck && renderDeck('upper')}
                            
                            {previewMode && (
                                <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <AlertCircle size={16} className="text-blue-400" />
                                    <p className="text-sm text-blue-400">Preview Mode - Clicking on seats is disabled</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </DndContext>
    )
}
