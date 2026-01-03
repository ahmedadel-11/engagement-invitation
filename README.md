# Ahmed & Manar Engagement Website 💍

A beautiful engagement ceremony website with guest wishes functionality.

## Features

- ✨ Elegant, responsive design
- ⏰ Live countdown timer
- 📍 Location with Google Maps
- 💌 Guest wishes submission
- 🔐 Admin panel to view/manage messages
- 📊 Export messages to CSV

## Deployment to Vercel

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"

### Step 3: Set Up Neon Postgres (Free Database for Messages)

1. In your Vercel dashboard, go to your project
2. Click on **"Storage"** tab
3. Click **"Neon"** from the Marketplace
4. Click **"Create"** to create a new Neon database
5. Name it (e.g., `engagement-db`)
6. Select a region close to your users (e.g., `aws-eu-central-1` for Middle East/Europe)
7. Click **"Create"**
8. Vercel will **automatically** add `DATABASE_URL` to your environment variables

### Step 4: Add Admin Password to Vercel

1. In Vercel dashboard, go to **"Settings"** → **"Environment Variables"**
2. Add this variable:

   | Name | Value |
   |------|-------|
   | `ADMIN_PASSWORD` | Your secure password (e.g., `Ahmed&Manar2026`) |

3. Click "Save"
4. **Redeploy** your project for changes to take effect

## Accessing Admin Panel

1. Go to `https://your-site.vercel.app/admin.html`
2. Enter your admin password
3. View, search, and manage guest messages
4. Export messages to CSV

## Project Structure

```
├── index.html          # Main website
├── admin.html          # Admin panel
├── css/
│   └── styles.css      # Stylesheets
├── js/
│   └── script.js       # Frontend JavaScript
├── api/
│   └── messages.js     # Serverless API for messages
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies
└── README.md           # This file
```

## Local Development

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
vercel dev
```

## Notes

- Messages are stored in Neon Postgres (free tier: 0.5 GB storage)
- If database is not configured, the API will return an error
- Admin panel works offline with localStorage data
- The admin password is required only for deleting messages

## Support

For any issues, please check:
1. Vercel deployment logs
2. Browser console for errors
3. Network tab for API responses

---

Made with ❤️ for Ahmed & Manar's special day
