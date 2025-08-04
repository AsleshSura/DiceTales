# DiceTales Deployment Guide

Complete guide for deploying DiceTales to various hosting platforms and environments.

## 🚀 Quick Deployment Options

| Platform | Difficulty | Cost | Best For |
|----------|------------|------|----------|
| [GitHub Pages](#github-pages) | Easy | Free | Open source projects |
| [Netlify](#netlify) | Easy | Free | Quick prototypes |
| [Vercel](#vercel) | Easy | Free | Modern deployments |
| [Firebase Hosting](#firebase-hosting) | Medium | Free | Google ecosystem |
| [Self-Hosted](#self-hosted) | Hard | Variable | Full control |

## 📋 Pre-Deployment Checklist

### Required Files
Ensure these files are present in your repository:
- [ ] `index.html` - Main game interface
- [ ] `advanced/` directory with game files
- [ ] `better-dm/` directory for campaign management
- [ ] `base/` directory for simple game version
- [ ] `docs/` directory (optional but recommended)
- [ ] `README.md` - Project description
- [ ] `.gitignore` - Git ignore patterns

### Configuration Check
- [ ] `advanced/js/config.js` has correct settings for production
- [ ] AI services are properly configured
- [ ] No debug flags enabled in production
- [ ] HTTPS compatibility verified

### Testing Checklist
- [ ] Game loads without errors
- [ ] All AI services work (HuggingFace, Simple AI, Mock AI)
- [ ] Character creation functions properly
- [ ] Dice rolling works correctly
- [ ] Save/load functionality works
- [ ] Responsive design works on mobile/tablet
- [ ] Cross-browser compatibility verified

## 🔧 GitHub Pages

**Best for**: Open source projects, free hosting, automatic updates

### Setup Steps

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access Your Game**
   - URL will be: `https://yourusername.github.io/DiceTales/`
   - Initial deployment takes 5-10 minutes

### Custom Domain (Optional)
1. **Add CNAME file**
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS**
   - Add CNAME record: `www` → `yourusername.github.io`
   - Add A records for apex domain:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```

### GitHub Pages Configuration
```yaml
# .github/workflows/pages.yml (optional - for advanced builds)
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Pages
        uses: actions/configure-pages@v2
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v1
```

## 🌐 Netlify

**Best for**: Drag-and-drop deployment, build optimization, form handling

### Method 1: Drag and Drop
1. Visit [netlify.com](https://netlify.com)
2. Sign up for free account
3. Drag your DiceTales folder to the deploy area
4. Get instant unique URL (e.g., `https://amazing-name-123456.netlify.app`)

### Method 2: Git Integration
1. **Connect Repository**
   - Login to Netlify
   - Click **New site from Git**
   - Choose GitHub/GitLab/Bitbucket
   - Select your DiceTales repository

2. **Build Settings**
   ```yaml
   Build command: # Leave empty (static site)
   Publish directory: . # Root directory
   ```

3. **Environment Variables** (if needed)
   - Go to **Site settings** → **Environment variables**
   - Add any configuration variables

### Netlify Configuration
Create `netlify.toml` in root directory:
```toml
[build]
  publish = "."
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  condition = "Role=landing"

[context.production.environment]
  NODE_ENV = "production"
```

### Custom Domain on Netlify
1. **Add Domain**
   - Go to **Site settings** → **Domain management**
   - Click **Add custom domain**
   - Enter your domain name

2. **DNS Configuration**
   - Add CNAME record: `www` → `your-site-name.netlify.app`
   - Or use Netlify's nameservers for full DNS management

## ⚡ Vercel

**Best for**: Modern deployment, excellent performance, edge functions

### Method 1: Vercel CLI
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd DiceTales
   vercel
   ```

3. **Follow Prompts**
   - Link to existing project or create new
   - Confirm settings
   - Get deployment URL

### Method 2: Git Integration
1. **Connect Repository**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

2. **Build Configuration**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "**/*",
         "use": "@vercel/static"
       }
     ]
   }
   ```

### Vercel Configuration
Create `vercel.json` in root directory:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🔥 Firebase Hosting

**Best for**: Google ecosystem integration, analytics, performance monitoring

### Setup Steps

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   cd DiceTales
   firebase login
   firebase init hosting
   ```

3. **Configuration**
   ```javascript
   // firebase.json
   {
     "hosting": {
       "public": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

### Firebase Features
- **Analytics**: Track user engagement
- **Performance Monitoring**: Monitor load times
- **Hosting**: Fast global CDN
- **Custom Domain**: Easy SSL setup

## 🏠 Self-Hosted

**Best for**: Full control, custom server configuration, enterprise deployments

### Apache HTTP Server

1. **Upload Files**
   ```bash
   scp -r DiceTales/* user@server:/var/www/html/dicetales/
   ```

2. **Apache Configuration**
   ```apache
   # /etc/apache2/sites-available/dicetales.conf
   <VirtualHost *:80>
       ServerName dicetales.yourdomain.com
       DocumentRoot /var/www/html/dicetales
       
       <Directory /var/www/html/dicetales>
           AllowOverride All
           Require all granted
       </Directory>
       
       # Security headers
       Header always set X-Frame-Options DENY
       Header always set X-Content-Type-Options nosniff
       Header always set X-XSS-Protection "1; mode=block"
   </VirtualHost>
   ```

3. **Enable Site**
   ```bash
   sudo a2ensite dicetales
   sudo systemctl reload apache2
   ```

### Nginx

1. **Upload Files**
   ```bash
   rsync -av DiceTales/ user@server:/var/www/dicetales/
   ```

2. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/dicetales
   server {
       listen 80;
       server_name dicetales.yourdomain.com;
       root /var/www/dicetales;
       index index.html;
   
       location / {
           try_files $uri $uri/ =404;
       }
   
       # Security headers
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;
       add_header X-XSS-Protection "1; mode=block";
   
       # Cache static assets
       location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/dicetales /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**
   ```bash
   docker build -t dicetales .
   docker run -d -p 8080:80 dicetales
   ```

3. **Docker Compose**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     dicetales:
       build: .
       ports:
         - "8080:80"
       restart: unless-stopped
   ```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Free SSL)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d dicetales.yourdomain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Cloudflare SSL
1. Sign up for Cloudflare
2. Add your domain
3. Update nameservers
4. Enable SSL in Cloudflare dashboard

## 📊 Performance Optimization

### Content Delivery Network (CDN)
```html
<!-- Add to index.html head -->
<link rel="preconnect" href="https://api-inference.huggingface.co">
<link rel="preload" href="advanced/css/main.css" as="style">
<link rel="preload" href="advanced/js/main.js" as="script">
```

### Compression
```apache
# Apache .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### Caching Headers
```nginx
# Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## 🔍 Monitoring and Analytics

### Google Analytics Setup
1. **Add to index.html**
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

### Error Tracking
```javascript
// Add to main.js
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Send to error tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});
```

### Performance Monitoring
```javascript
// Track AI response times
const trackAIPerformance = (service, duration, success) => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ai_response_time', {
            service: service,
            duration: Math.round(duration),
            success: success
        });
    }
};
```

## 🐛 Troubleshooting Deployment

### Common Issues

**"AI not working after deployment"**
- Check HTTPS requirements for HuggingFace API
- Verify CORS settings if using custom domain
- Test with browser dev tools console

**"Game won't load"**
- Check file paths are correct (case-sensitive on Linux)
- Verify all files uploaded successfully
- Check server error logs

**"Styles not loading"**
- Verify CSS file paths
- Check MIME types configured correctly
- Test with browser dev tools

**"Save/load not working"**
- LocalStorage might be disabled in some hosting environments
- Test in incognito mode
- Check browser security settings

### Debug Mode
Enable debug mode for troubleshooting:
```javascript
// In advanced/js/config.js
const AI_CONFIG = {
    DEBUG_MODE: true,          // Enable debug logging
    SHOW_AI_PROMPTS: true,     // Log AI requests
    LOG_PERFORMANCE: true      // Track performance metrics
};
```

### Health Check Endpoint
Create `health.html` for monitoring:
```html
<!DOCTYPE html>
<html>
<head>
    <title>DiceTales Health Check</title>
</head>
<body>
    <h1>DiceTales Status: OK</h1>
    <p>Timestamp: <span id="timestamp"></span></p>
    <script>
        document.getElementById('timestamp').textContent = new Date().toISOString();
    </script>
</body>
</html>
```

## 📈 Scaling Considerations

### Traffic Optimization
- Use CDN for static assets
- Implement proper caching headers
- Consider service worker for offline functionality
- Monitor API rate limits (HuggingFace)

### High Availability
- Use multiple hosting providers
- Implement health checks
- Set up monitoring alerts
- Consider backup AI services

### Cost Management
- Monitor bandwidth usage
- Optimize image sizes
- Use efficient hosting plans
- Implement usage analytics

---

## 🎯 Next Steps

After successful deployment:

1. **Test thoroughly** on the live site
2. **Monitor performance** and user engagement
3. **Set up analytics** to track usage
4. **Plan updates** and new features
5. **Backup regularly** and maintain documentation

**Need help?** Check the [Technical Overview](TECHNICAL_OVERVIEW.md) for architectural details or [Setup Guide](SETUP_GUIDE.md) for local development.
