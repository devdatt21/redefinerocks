# 🔐 Google OAuth Setup Guide

## Step-by-Step Google Cloud Console Configuration

### 1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

### 2. **Create or Select Project**
   - Click "Select a project" at the top
   - Either create a new project or select existing one
   - Project name suggestion: "Redefine-QA-Hub"

### 3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

### 4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "Internal" (if you have Google Workspace) or "External"
   - Fill in required fields:
     - App name: "Redefine Q&A Hub"
     - User support email: your email
     - Developer contact: your email
   - Add your domain if using "Internal"
   - Save and continue

### 5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Redefine QA Hub"
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com (for production)
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google (for production)
   ```

### 6. **Copy Credentials**
   - Copy the "Client ID" and "Client Secret"
   - Update your `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   ```

## 🐛 Common Issues & Solutions

### Issue 1: "Error 400: redirect_uri_mismatch"
**Solution:** Check that your redirect URI exactly matches:
- For local: `http://localhost:3000/api/auth/callback/google`
- Case sensitive and no trailing slashes

### Issue 2: "This app isn't verified"
**Solutions:**
- For internal use: Set consent screen to "Internal" 
- For external: Submit for verification or add test users
- Add your email as a test user in OAuth consent screen

### Issue 3: "Access blocked: This app's request is invalid"
**Solution:** 
- Ensure all required fields in OAuth consent screen are filled
- Check that scopes are properly configured
- Verify your domain is added to authorized domains

### Issue 4: Can't sign in with company email
**Solutions:**
1. **Check company email domain restriction in code**
2. **Verify Google Workspace settings**
3. **Add test users** (if external consent screen)

## 🔍 Testing Steps

1. **Test locally:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3000
   - Try signing in with your @redefinesolutions.com email

2. **Check browser console for errors**
3. **Check terminal/server logs for auth errors**

## 📋 Checklist

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs added correctly
- [ ] Client ID and Secret added to .env.local
- [ ] App domain configured (if using Internal)
- [ ] Test users added (if using External)

## 🚨 If Still Having Issues

1. **Check server logs** - Look for detailed error messages
2. **Verify environment variables** - Restart dev server after changes
3. **Clear browser cache** - Sign out of all Google accounts and try again
4. **Check domain restrictions** - Ensure your company allows OAuth apps

## 💡 Pro Tips

- Use "Internal" consent screen if your company has Google Workspace
- Add multiple test emails during development
- Keep credentials secure and never commit to version control
- Use different OAuth clients for development and production
