// Vercel Serverless Function for handling messages
// Uses Neon Postgres for storage (Free tier available)

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ 
            success: false, 
            error: 'DATABASE_URL not configured. Please add Neon database in Vercel Storage.' 
        });
    }

    try {
        // Initialize Neon connection
        const sql = neon(process.env.DATABASE_URL);

        // Ensure table exists
        await sql`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // GET - Retrieve all messages
        if (req.method === 'GET') {
            const rows = await sql`
                SELECT id, name, message, created_at as date 
                FROM messages 
                ORDER BY created_at DESC
            `;
            return res.status(200).json({ success: true, messages: rows });
        }

        // POST - Add a new message
        if (req.method === 'POST') {
            const { name, message } = req.body;

            if (!name || !message) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Name and message are required' 
                });
            }

            const rows = await sql`
                INSERT INTO messages (name, message)
                VALUES (${name.trim()}, ${message.trim()})
                RETURNING id, name, message, created_at as date
            `;

            return res.status(201).json({ 
                success: true, 
                message: rows[0] 
            });
        }

        // DELETE - Remove a message (for admin)
        if (req.method === 'DELETE') {
            const { id } = req.body;
            const authHeader = req.headers.authorization;
            
            // Simple password protection for delete
            if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Unauthorized' 
                });
            }

            if (!id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Message ID is required' 
                });
            }

            await sql`DELETE FROM messages WHERE id = ${id}`;

            return res.status(200).json({ 
                success: true, 
                message: 'Message deleted' 
            });
        }

        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Database connection error'
        });
    }
}
