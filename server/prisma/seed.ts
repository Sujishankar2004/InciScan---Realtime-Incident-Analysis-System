
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    const incidents = [
        {
            type: 'Crowd',
            description: 'High density crowd detected near main entrance',
            latitude: 40.7128,
            longitude: -74.0060,
            confidence: 0.85,
            status: 'verified',
            severity: 'high',
            camera_id: 'CAM-001',
        },
        {
            type: 'Theft',
            description: 'Suspicious activity detected: Bag snatching attempt',
            latitude: 40.7138,
            longitude: -74.0070,
            confidence: 0.92,
            status: 'pending',
            severity: 'critical',
            camera_id: 'CAM-003',
        },
        {
            type: 'Violence',
            description: 'Fighting detected in sector 4',
            latitude: 40.7118,
            longitude: -74.0050,
            confidence: 0.78,
            status: 'resolved',
            severity: 'medium',
            camera_id: 'CAM-002',
        },
    ]

    for (const i of incidents) {
        const incident = await prisma.incident.create({
            data: i,
        })
        console.log(`Created incident with id: ${incident.id}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
