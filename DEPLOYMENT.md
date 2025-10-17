# Deployment Guide for hostcreators.sk

## 🚀 Deployment Steps

### 1. Build the Project
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Prepare Files for Upload
The build process creates a `dist/` folder with all the production files.

### 3. Upload to hostcreators.sk
1. Upload all files from `dist/` folder to your web server
2. Make sure `.htaccess` file is uploaded (for Apache servers)
3. Set up your domain `refov.com` to point to the server

### 4. Domain Configuration
- Point `refov.com` to your hostcreators.sk server
- Set up SSL certificate (Let's Encrypt recommended)
- Configure DNS records

### 5. Server Requirements
- **Web Server**: Apache or Nginx
- **PHP**: Not required (static site)
- **Node.js**: Not required (pre-built)
- **SSL**: Required for production

### 6. Environment Variables
The site uses hardcoded Supabase credentials, so no environment variables needed.

### 7. Testing
After deployment, test:
- [ ] Main page loads: `https://refov.com`
- [ ] Profile creation: `https://refov.com/post`
- [ ] Candidate browsing: `https://refov.com/candidates`
- [ ] Admin access: `https://refov.com/admin`

## 🔧 Troubleshooting

### If the site shows 404 errors:
- Check that `.htaccess` file is uploaded
- Verify URL rewriting is enabled on the server

### If Supabase connection fails:
- Check browser console for errors
- Verify Supabase credentials are correct

### If admin page doesn't work:
- Credentials: `admin` / `FreshProfiles2024!`
- Check browser console for errors

## 📞 Support
If you need help with deployment, contact hostcreators.sk support.
