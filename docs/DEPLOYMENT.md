# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Client Authentication System to various hosting platforms. The application is built with Next.js 15 and can be deployed to any platform that supports Node.js.

## Prerequisites

- Node.js 18+ installed locally
- Git repository with your code
- Account on your chosen hosting platform

## Vercel (Recommended)

Vercel provides the best experience for Next.js applications with zero-configuration deployment.

### Automatic Deployment (GitHub Integration)

1. **Prepare Your Repository**
   ```bash
   # Ensure your code is pushed to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** (Optional)
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 1-2 minutes)
   - Your app will be available at `https://your-app.vercel.app`

### Manual Deployment (CLI)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Directory**
   ```bash
   # First deployment (follow prompts)
   vercel
   
   # Deploy to production
   vercel --prod
   ```

### Custom Domain Setup

1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

## Netlify

Netlify offers excellent static site hosting with continuous deployment.

### Automatic Deployment

1. **Connect Repository**
   - Visit [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-app.netlify.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Site will be available at `https://random-name.netlify.app`

### Manual Deployment

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy**
   ```bash
   # Login
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=.next
   ```

## Railway

Railway provides simple deployment with automatic HTTPS and custom domains.

### Deployment Steps

1. **Connect Repository**
   - Visit [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"

2. **Configuration** (Optional)
   Create `railway.json` in project root:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/"
     }
   }
   ```

3. **Environment Variables**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://your-app.up.railway.app
   ```

4. **Deploy**
   - Railway automatically detects Next.js and deploys
   - Available at generated Railway URL

## DigitalOcean App Platform

DigitalOcean App Platform offers managed hosting with automatic scaling.

### Deployment Steps

1. **Create App**
   - Visit [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure App**
   ```yaml
   # .do/app.yaml (optional)
   name: client-auth-app
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/client-auth-app
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   ```

3. **Environment Variables**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_BASE_URL=https://your-app.ondigitalocean.app
   ```

4. **Deploy**
   - Review configuration and click "Create Resources"
   - App will be available at DigitalOcean URL

## Docker Deployment

For containerized deployment on any platform supporting Docker.

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t client-auth-app .

# Run container
docker run -p 3000:3000 client-auth-app

# Or use docker-compose
docker-compose up -d
```

## AWS Amplify

AWS Amplify provides hosting with CI/CD and global CDN.

### Deployment Steps

1. **Connect Repository**
   - Visit [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_BASE_URL=https://main.d1234567890.amplifyapp.com
   ```

4. **Deploy**
   - Review settings and click "Save and deploy"
   - App will be available at Amplify URL

## Heroku

Heroku offers simple deployment with add-ons ecosystem.

### Deployment Steps

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from heroku.com/cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Configure Build**
   ```bash
   # Set Node.js version
   echo "node 18.x" > .nvmrc
   
   # Add to package.json
   {
     "engines": {
       "node": "18.x",
       "npm": "9.x"
     }
   }
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## Performance Optimization

### Build Optimization

1. **Bundle Analysis**
   ```bash
   # Install bundle analyzer
   npm install --save-dev @next/bundle-analyzer
   
   # Add to next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   })
   
   module.exports = withBundleAnalyzer(nextConfig)
   
   # Analyze bundle
   ANALYZE=true npm run build
   ```

2. **Image Optimization**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['randomuser.me', 'ui-avatars.com'],
       formats: ['image/webp', 'image/avif'],
     },
   }
   ```

### CDN Configuration

1. **Static Assets**
   ```javascript
   // next.config.js
   module.exports = {
     assetPrefix: process.env.NODE_ENV === 'production' 
       ? 'https://cdn.yourdomain.com' 
       : '',
   }
   ```

2. **Cache Headers**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/_next/static/(.*)',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ]
     },
   }
   ```

## Monitoring and Analytics

### Error Tracking

1. **Sentry Integration**
   ```bash
   npm install @sentry/nextjs
   ```

   ```javascript
   // sentry.client.config.js
   import * as Sentry from '@sentry/nextjs'
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   })
   ```

2. **Custom Error Boundary**
   ```typescript
   // components/error-boundary.tsx
   'use client'
   
   import { useEffect } from 'react'
   import * as Sentry from '@sentry/nextjs'
   
   export default function Error({
     error,
     reset,
   }: {
     error: Error & { digest?: string }
     reset: () => void
   }) {
     useEffect(() => {
       Sentry.captureException(error)
     }, [error])
   
     return (
       <div>
         <h2>Something went wrong!</h2>
         <button onClick={() => reset()}>Try again</button>
       </div>
     )
   }
   ```

### Analytics

1. **Google Analytics**
   ```bash
   npm install @next/third-parties
   ```

   ```typescript
   // app/layout.tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode
   }) {
     return (
       <html>
         <body>{children}</body>
         <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
       </html>
     )
   }
   ```

## Security Considerations

### Environment Variables

Never commit sensitive data to your repository:

```bash
# .env.local (not committed)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

### Security Headers

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
}
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version
   
   # Clear cache and reinstall
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

3. **Environment Variable Issues**
   ```bash
   # Check environment variables are set
   echo $NEXT_PUBLIC_BASE_URL
   
   # Verify in build output
   npm run build 2>&1 | grep -i "environment"
   ```

### Platform-Specific Issues

#### Vercel
- **Function Timeout**: Increase timeout in vercel.json
- **Bundle Size**: Use dynamic imports to reduce bundle size

#### Netlify
- **Redirect Issues**: Configure `_redirects` file
- **Build Plugin**: Use `@netlify/plugin-nextjs`

#### Railway
- **Port Configuration**: Ensure PORT environment variable is used
- **Memory Limits**: Upgrade plan if needed

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] All routes are accessible
- [ ] Authentication flow works
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested
- [ ] Performance metrics checked (Lighthouse)
- [ ] Error tracking configured
- [ ] Analytics implemented
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Backup strategy in place