import { seedDatabase } from '../src/lib/seed'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function runSeed() {
    try {
        console.log('Running database seed...')
        await seedDatabase()
        console.log('Seed completed successfully.')
    } catch (error) {
        console.error('Seed failed:', error)
        process.exit(1)
    }
}

runSeed()
