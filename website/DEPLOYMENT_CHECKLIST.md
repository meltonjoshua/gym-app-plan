# 🚀 FitTracker Pro - cPanel Deployment Checklist

## ✅ Pre-Deployment Checklist

### Local Development Complete
- [x] Website components created and tested
- [x] Next.js configuration optimized for static export
- [x] Build process tested successfully
- [x] .htaccess file configured for Apache
- [x] Deployment scripts created and tested

## 📦 Build & Package

### Option 1: Using Deployment Script (Recommended)
```bash
# Run the complete deployment build
./deploy-cpanel.sh

# Create ZIP for easy upload
./create-zip.sh
```

### Option 2: Manual Process
```bash
# Build the static site
npm run build:cpanel

# Copy .htaccess file
npm run copy:htaccess

# Create ZIP manually
cd out && zip -r ../fittracker-pro.zip . && cd ..
```

## 🌐 cPanel Upload Process

### Step 1: Access cPanel
- [ ] Login to your hosting provider's cPanel
- [ ] Navigate to File Manager
- [ ] Go to `public_html` directory

### Step 2: Backup Existing Site (if applicable)
- [ ] Download current website files as backup
- [ ] Create backup folder in cPanel

### Step 3: Upload Files

#### Option A: ZIP Upload (Easier)
- [ ] Upload the generated ZIP file to `public_html`
- [ ] Right-click ZIP file → Extract
- [ ] Move extracted files to `public_html` root
- [ ] Delete ZIP file and extracted folder
- [ ] Verify `.htaccess` file is present

#### Option B: Direct Upload
- [ ] Select all files from `out` directory
- [ ] Upload to `public_html` directory
- [ ] Ensure `.htaccess` file is uploaded
- [ ] Verify all `_next` directory contents uploaded

### Step 4: Set File Permissions
- [ ] Set directories to `755` permissions
- [ ] Set files to `644` permissions
- [ ] Ensure `.htaccess` has `644` permissions

## 🔧 Configuration & Testing

### DNS & Domain Setup
- [ ] Verify domain points to hosting server
- [ ] Check DNS propagation (24-48 hours for changes)
- [ ] Ensure SSL certificate is active

### Website Testing
- [ ] Visit your domain to test main page
- [ ] Test navigation between sections
- [ ] Verify images and assets load correctly
- [ ] Test on mobile devices
- [ ] Check loading speed

### Performance Optimization
- [ ] Test with Google PageSpeed Insights
- [ ] Verify Gzip compression is working
- [ ] Check browser caching headers
- [ ] Test from different locations

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 404 Errors on Page Refresh
- **Cause**: `.htaccess` file missing or not working
- **Solution**: 
  - [ ] Verify `.htaccess` uploaded to root directory
  - [ ] Check if mod_rewrite is enabled on server
  - [ ] Contact hosting provider if needed

#### Assets Not Loading
- **Cause**: Missing `_next` directory or incorrect permissions
- **Solution**:
  - [ ] Re-upload `_next` directory completely
  - [ ] Check file permissions (644 for files, 755 for directories)
  - [ ] Clear browser cache

#### Blank/White Page
- **Cause**: JavaScript errors or missing files
- **Solution**:
  - [ ] Check browser console for errors
  - [ ] Verify all files uploaded correctly
  - [ ] Test on different browsers

#### Styles Not Applied
- **Cause**: CSS files not loading or cached
- **Solution**:
  - [ ] Check `_next/static/css/` directory uploaded
  - [ ] Clear browser cache (Ctrl+F5)
  - [ ] Verify MIME types in `.htaccess`

## 📊 Post-Deployment

### SEO & Analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if needed)
- [ ] Configure Facebook Pixel (if needed)
- [ ] Test social media sharing

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor loading speeds
- [ ] Check for broken links
- [ ] Test contact forms (if applicable)

### Security
- [ ] Verify HTTPS is working
- [ ] Check security headers
- [ ] Test for common vulnerabilities
- [ ] Regular backup schedule

## 📞 Support Contacts

### Hosting Provider Support
- Contact for: Apache configuration, SSL setup, server issues
- Have ready: Domain name, cPanel username, error descriptions

### Website Support
- Check browser console for JavaScript errors
- Verify all files uploaded correctly
- Test with different browsers and devices

## 🔄 Future Updates

### Update Process
1. [ ] Make changes to source code
2. [ ] Run `./deploy-cpanel.sh`
3. [ ] Upload new files to cPanel
4. [ ] Test changes
5. [ ] Clear any caches

### Backup Strategy
- [ ] Regular website backups
- [ ] Keep source code in version control
- [ ] Document any custom changes

---

## 📋 Quick Reference

**Build Command**: `./deploy-cpanel.sh`
**ZIP Creation**: `./create-zip.sh`
**Upload Location**: `public_html/`
**Required Permissions**: Files 644, Directories 755
**Key File**: `.htaccess` (must be in root)

**Need Help?** Check `CPANEL_DEPLOYMENT.md` for detailed instructions.
