# FitTracker Pro Website - cPanel Deployment Guide

This guide explains how to deploy the FitTracker Pro website to cPanel hosting.

## 🎯 Overview

The website has been configured for static export, making it compatible with cPanel shared hosting. The build process creates a static version of the site that can be uploaded directly to your cPanel account.

## 📋 Prerequisites

- cPanel hosting account with file manager access
- Node.js 18+ and npm installed (for building)
- FTP client (optional, for large uploads)

## 🚀 Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
# Make the script executable
chmod +x deploy-cpanel.sh

# Run the deployment build
./deploy-cpanel.sh
```

### Option 2: Manual Build

```bash
# Install dependencies
npm install

# Build for cPanel
npm run build:cpanel

# Copy .htaccess file
cp public/.htaccess out/.htaccess
```

## 📁 Upload to cPanel

### Method 1: cPanel File Manager

1. **Login to cPanel**
   - Access your hosting provider's cPanel
   - Navigate to "File Manager"

2. **Navigate to public_html**
   - Go to the `public_html` directory
   - This is where your website files should be placed

3. **Upload Files**
   - Select all files from the `out` directory
   - Upload them to `public_html`
   - **Important:** Make sure `.htaccess` file is included

4. **Set Permissions**
   - Set directories to `755`
   - Set files to `644`
   - Ensure `.htaccess` has `644` permissions

### Method 2: FTP Upload

```bash
# Example using FileZilla or command line FTP
# Upload all contents of 'out' directory to public_html
```

## ⚙️ Configuration Options

### Subdirectory Deployment

If deploying to a subdirectory (e.g., `yoursite.com/fittracker`):

1. **Edit `next.config.js`:**
```javascript
const nextConfig = {
  basePath: '/fittracker',
  assetPrefix: '/fittracker',
  // ... other config
}
```

2. **Rebuild and upload to subdirectory:**
```bash
npm run build:cpanel
# Upload to public_html/fittracker/
```

### Custom Domain

For custom domains, ensure:
- Domain points to your cPanel hosting
- SSL certificate is configured
- `.htaccess` handles HTTPS redirects

## 🔧 Troubleshooting

### Common Issues

1. **404 Errors on Page Refresh**
   - Ensure `.htaccess` file is uploaded
   - Check Apache mod_rewrite is enabled

2. **Assets Not Loading**
   - Verify all `_next` directory files uploaded
   - Check file permissions (644 for files)

3. **Styles Not Applied**
   - Confirm CSS files in `_next/static/css/` uploaded
   - Check browser cache (Ctrl+F5 to refresh)

4. **Images Not Displaying**
   - Ensure image files uploaded correctly
   - Verify MIME types in `.htaccess`

### Performance Issues

1. **Enable Gzip Compression**
   - Included in `.htaccess` file
   - Verify with hosting provider if not working

2. **Browser Caching**
   - Cache headers set in `.htaccess`
   - May need hosting provider configuration

### Security Considerations

1. **File Permissions**
   - Never set files to 777
   - Use 644 for files, 755 for directories

2. **Sensitive Files**
   - `.htaccess` blocks access to config files
   - Remove any `.env` files from upload

## 📊 File Structure After Upload

```
public_html/
├── .htaccess                 # Apache configuration
├── index.html               # Main page
├── 404.html                 # Error page
├── _next/                   # Next.js assets
│   ├── static/
│   │   ├── css/            # Stylesheets
│   │   ├── js/             # JavaScript
│   │   └── media/          # Images/fonts
│   └── ...
└── DEPLOYMENT_INFO.txt      # Build information
```

## 🌐 Going Live

1. **Test the Website**
   - Visit your domain
   - Test all pages and features
   - Check mobile responsiveness

2. **SEO Setup**
   - Submit sitemap to Google Search Console
   - Configure analytics (if needed)
   - Set up monitoring

3. **Performance Optimization**
   - Test with PageSpeed Insights
   - Monitor loading times
   - Consider CDN if needed

## 📞 Support

### Hosting Provider Support
- Contact your hosting provider for:
  - Apache configuration issues
  - SSL certificate setup
  - Server-side problems

### Website Issues
- Check browser console for errors
- Verify all files uploaded correctly
- Test with different browsers

## 🔄 Updates

To update the website:

1. Make changes to source code
2. Run build process again
3. Upload new files to cPanel
4. Clear any caches

```bash
# Update process
git pull origin main
npm install
./deploy-cpanel.sh
# Upload new files from 'out' directory
```

## 📝 Notes

- **Static Site**: This is a static export, so server-side features are disabled
- **No Node.js Required**: Once uploaded, no Node.js needed on server
- **Browser Compatibility**: Works with all modern browsers
- **Mobile Optimized**: Fully responsive design included

---

**Need Help?** Check your hosting provider's documentation or contact their support team for cPanel-specific issues.
