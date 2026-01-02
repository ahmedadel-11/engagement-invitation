// Vercel Serverless Function for handling messages
// Uses Vercel KV (Redis) for storage

import { kv } from '@vercel/kv';

const MESSAGES_KEY = 'engagement_wishes';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - Retrieve all messages
        if (req.method === 'GET') {
            const messages = await kv.get(MESSAGES_KEY) || [];
            return res.status(200).json({ success: true, messages });
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

            // Get existing messages
            const messages = await kv.get(MESSAGES_KEY) || [];

            // Add new message
            const newMessage = {
                id: Date.now().toString(),
                name: name.trim(),
                message: message.trim(),
                date: new Date().toISOString()
            };

            messages.unshift(newMessage);

            // Save to KV store
            await kv.set(MESSAGES_KEY, messages);

            return res.status(201).json({ 
                success: true, 
                message: newMessage 
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

            const messages = await kv.get(MESSAGES_KEY) || [];
            const filteredMessages = messages.filter(msg => msg.id !== id);
            
            await kv.set(MESSAGES_KEY, filteredMessages);

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
            error: 'Internal server error' 
        });
    }
}
