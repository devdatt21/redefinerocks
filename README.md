# 🧠 Q&A Hub - Redefine Solutions

A modern, interactive Q&A platform built exclusively for Redefine Solutions employees. Features real-time collaboration, voice-to-text answers, smart categorization, and seamless team communication.

## ✨ Features

- **🔐 Secure Authentication**: Only `@redefinesolutions.com` emails allowed
- **📝 Rich Q&A System**: Ask questions and provide answers with text or voice
- **🎤 Speech-to-Text**: Free Web Speech API integration for voice answers
- **📊 Smart Organization**: Create and manage question groups (Marketing, Development, etc.)
- **🔍 Powerful Search**: Real-time search across all questions and answers
- **👍 Social Features**: Like questions/answers and track engagement
- **📱 Responsive Design**: Optimized for mobile and desktop
- **⚡ Real-time Updates**: Live collaboration and instant notifications

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: 
  - PostgreSQL (Neon) - Text data (users, questions, answers, likes)
  - Cloudinary - Audio file storage and management
- **ORM**: Prisma for PostgreSQL
- **File Storage**: Cloudinary for audio files
- **UI Components**: Custom components with Headless UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Cloudinary account for audio file storage
- Google Cloud Console project for OAuth

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd redefinerocks
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Environment Variables**
   Edit `.env.local` with your credentials:
   ```env
   # Database URLs
   DATABASE_URL="postgresql://user:password@host:port/database"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Google OAuth (from Google Cloud Console)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed database with sample data
   npx prisma db seed
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) and sign in with your `@redefinesolutions.com` email.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── groups/        # Group management
│   │   ├── questions/     # Question operations
│   │   ├── answers/       # Answer operations
│   │   └── likes/         # Like/unlike functionality
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Sidebar, Header)
│   └── questions/         # Question-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # External service configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── cloudinary.ts     # Cloudinary configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔧 Setup Guides

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### Database Setup

#### Neon PostgreSQL
1. Visit [Neon](https://neon.tech/) and create account
2. Create new project
3. Copy connection string to `DATABASE_URL`

#### MongoDB Atlas
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Copy connection string to `MONGODB_URI`

### Cloudinary Setup

1. **Create Account**
   - Visit [Cloudinary](https://cloudinary.com/) and create a free account
   - Free tier includes 25GB storage and 25GB bandwidth per month

2. **Get Credentials**
   - Go to Dashboard after signup
   - Copy your Cloud Name, API Key, and API Secret
   - Add these to your `.env.local` file

3. **Configure Settings** (Optional)
   - In Dashboard > Settings > Upload
   - Set up upload presets if needed
   - Configure file size limits and formats

The system will automatically:
- Upload audio files to `qa-platform/audio/` folder
- Convert files to MP3 format for better web compatibility
- Generate secure URLs for playback

## 📖 Usage

### For Users
1. **Sign In**: Use your `@redefinesolutions.com` Google account
2. **Browse Questions**: View all questions or filter by group
3. **Ask Questions**: Click "Add Question" and select a group
4. **Answer Questions**: Click "Answer" and type or use voice input
5. **Engage**: Like questions and answers you find helpful
6. **Search**: Use the search bar to find specific content

### For Administrators
- **Manage Groups**: Create new question categories
- **Monitor Activity**: Track engagement and popular content
- **User Management**: View user activity and contributions

## 🎯 Key Features Explained

### Voice-to-Text Answers
- Uses browser's native Web Speech API (free)
- Supports continuous speech recognition
- Real-time transcription with text editing
- Fallback to text input if speech not supported

### Smart Search & Filtering
- Real-time search across questions and answers
- Filter by groups, users, or popularity
- Sort by recent, most liked, or by user

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔒 Security Features

- **Email Domain Restriction**: Only `@redefinesolutions.com` emails
- **OAuth Authentication**: Secure Google-based login
- **CSRF Protection**: Built-in NextAuth security
- **Data Validation**: Server-side input validation
- **Rate Limiting**: API endpoint protection

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel
```

### Environment Variables for Production
Ensure these are set in your production environment:
- `DATABASE_URL`
- `MONGODB_URI`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 API Reference

### Authentication
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create new group

### Questions
- `GET /api/questions` - List questions (with filters)
- `POST /api/questions` - Create new question
- `GET /api/questions/[id]` - Get question with answers

### Answers
- `POST /api/answers` - Submit answer

### Likes
- `POST /api/likes` - Toggle like/unlike

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Google OAuth credentials
   - Verify redirect URI configuration
   - Ensure `NEXTAUTH_SECRET` is set

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check database server status
   - Run `npx prisma db push` to sync schema

3. **Voice input not working**
   - Ensure HTTPS in production (required for mic access)
   - Check browser compatibility
   - Verify microphone permissions

## 📄 License

This project is proprietary software developed for Redefine Solutions internal use.

---

**Built with ❤️ for the Redefine Solutions team**
