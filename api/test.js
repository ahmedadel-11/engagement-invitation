// Simple test endpoint to verify API is working
export default function handler(req, res) {
    res.status(200).json({ 
        success: true, 
        message: 'API is working!',
        env: {
            hasDatabase: !!process.env.DATABASE_URL,
            hasAdminPassword: !!process.env.ADMIN_PASSWORD
        }
    });
}
