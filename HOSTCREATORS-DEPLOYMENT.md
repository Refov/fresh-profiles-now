# 🚀 Deployment Guide for hostcreators.sk

## Option 1: Manual Deployment (Recommended for first setup)

### 1. Build the Project
```bash
npm run build
```

### 2. Upload Files
Upload ALL files from the `dist/` folder to your hostcreators.sk server:
- Upload to your domain's `public_html` directory
- Make sure `.htaccess` file is uploaded (for SPA routing)

### 3. Test Your Site
- Visit `https://refov.com`
- Test all pages: `/post`, `/candidates`, `/admin`

---

## Option 2: Automatic Deployment with GitHub Actions

### 1. Set up GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `HOSTCREATORS_HOST` - Your server IP or domain
- `HOSTCREATORS_USERNAME` - Your SSH username
- `HOSTCREATORS_SSH_KEY` - Your private SSH key
- `HOSTCREATORS_PORT` - SSH port (usually 22)

### 2. Configure SSH Access
1. Generate SSH key pair on your local machine:
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

2. Add public key to hostcreators.sk server:
```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub username@your-server.com
```

3. Add private key to GitHub Secrets as `HOSTCREATORS_SSH_KEY`

### 3. Update Deployment Path
Edit `.github/workflows/deploy.yml` and update:
- `/path/to/your/domain/public_html` to your actual domain path
- Server details in the workflow

### 4. Deploy
Push to `main` branch to trigger automatic deployment:
```bash
git add .
git commit -m "Deploy to hostcreators.sk"
git push origin main
```

---

## 🔧 Configuration Files

### `.htaccess` (Apache Configuration)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Domain Configuration
- Point `refov.com` to your hostcreators.sk server
- Set up SSL certificate (Let's Encrypt recommended)
- Configure DNS records

---

## 🧪 Testing Checklist

After deployment, test:
- [ ] Main page loads: `https://refov.com`
- [ ] Profile creation: `https://refov.com/post`
- [ ] Browse candidates: `https://refov.com/candidates`
- [ ] Admin access: `https://refov.com/admin`
- [ ] Mobile responsiveness
- [ ] All forms work correctly
- [ ] LinkedIn links open properly

---

## 🆘 Troubleshooting

### White Screen
- Check browser console for errors
- Verify all files uploaded correctly
- Check `.htaccess` file is present

### 404 Errors
- Ensure `.htaccess` file is uploaded
- Check Apache mod_rewrite is enabled
- Verify file permissions (755 for directories, 644 for files)

### Build Issues
- Run `npm install` before building
- Check Node.js version (18+ recommended)
- Clear npm cache: `npm cache clean --force`

---

## 📞 Support

If you need help with hostcreators.sk configuration, contact their support team with:
- Your domain: `refov.com`
- Technology: React SPA with Apache
- Requirements: mod_rewrite enabled, SSL certificate
