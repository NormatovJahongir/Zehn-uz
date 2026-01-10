import { NextResponse } from 'next/server';

/**
 * GET /api/admin/stats
 *
 * NOTE: This route returns mock/demo data. Replace the mock implementation
 * with real queries to your database/ORM (Prisma, TypeORM, etc.) to compute:
 *  - totalStudents
 *  - totalCenters
 *  - totalRevenue
 *  - centers list
 *
 * Example with Prisma (pseudo):
 * const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' }});
 * const centers = await prisma.center.findMany();
 * const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });
 */

export async function GET() {
  try {
    // Mock centers (replace with DB fetch)
    const centers = [
      {
        id: 'c1',
        name: 'Central Learning Center',
        addressLine1: '123 Main St',
        city: 'Tashkent',
        state: 'Tashkent Region',
        postalCode: '100000',
        country: 'Uzbekistan',
        phone: '+998901234567',
        email: 'central@edu.com',
        latitude: 41.2995,
        longitude: 69.2401,
        managerId: 'u1',
        createdAt: new Date('2024-02-10T09:00:00Z').toISOString(),
      },
      {
        id: 'c2',
        name: 'Westside Training Hub',
        addressLine1: '45 West Ave',
        city: 'Samarkand',
        state: 'Samarkand Region',
        postalCode: '140000',
        country: 'Uzbekistan',
        phone: '+998909876543',
        email: 'westside@edu.com',
        latitude: 39.6542,
        longitude: 66.9597,
        managerId: 'u2',
        createdAt: new Date('2024-06-15T12:30:00Z').toISOString(),
      },
    ];

    // Mock totals (compute from your DB in production)
    const totalStudents = 324; // e.g., await prisma.user.count({ where: { role: 'STUDENT' }})
    const totalCenters = centers.length; // e.g., await prisma.center.count()
    const totalRevenue = 54230.5; // e.g., sum of payments (in main currency unit, e.g., USD)

    const payload = {
      totalStudents,
      totalCenters,
      totalRevenue,
      currency: 'USD',
      centers,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error('Failed to build admin stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}