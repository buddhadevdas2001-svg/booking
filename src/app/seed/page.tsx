'use client'

import { useState } from 'react'
import { seedDatabase } from '@/lib/seed'
import toast from 'react-hot-toast'

export default function SeedPage() {
    const [seeding, setSeeding] = useState(false)
    const [result, setResult] = useState<string>('')

    const handleSeed = async () => {
        setSeeding(true)
        setResult('Starting database seeding...')

        try {
            await seedDatabase()
            setResult('Database seeded successfully!')
            toast.success('Database seeded successfully!')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            setResult(`Error: ${errorMessage}`)
            toast.error('Failed to seed database')
        } finally {
            setSeeding(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-8 text-3xl font-bold text-white">Database Seeder</h1>

                <div className="card">
                    <h2 className="mb-4 text-xl font-bold text-white">Seed Sample Data</h2>
                    <p className="mb-6 text-slate-400">
                        This will add sample routes, buses, and trips to your database so you can test the search functionality.
                    </p>

                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="btn-primary mb-4"
                    >
                        {seeding ? 'Seeding Database...' : 'Seed Database'}
                    </button>

                    {result && (
                        <div className="rounded-lg bg-slate-800 p-4">
                            <pre className="whitespace-pre-wrap text-sm text-slate-300">{result}</pre>
                        </div>
                    )}

                    <div className="mt-6 text-sm text-slate-400">
                        <p>Sample data includes:</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>Routes: Mumbai → Pune, Delhi → Agra, Bangalore → Chennai</li>
                            <li>Buses: AC Sleeper and Non-AC Seater</li>
                            <li>Trips: Scheduled for tomorrow and day after</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}