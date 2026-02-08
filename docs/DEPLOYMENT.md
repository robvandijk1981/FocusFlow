# FocusFlow Backend Deployment Guide

This guide covers deploying the FocusFlow backend to various hosting platforms.

## Prerequisites

Before deploying, ensure you have:

- A managed PostgreSQL database (or use the platform's built-in database)
- Your frontend URL for CORS configuration
- Basic understanding of environment variables

## Environment Variables

All deployment platforms require these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (usually auto-set) | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://yourapp.com,https://www.yourapp.com` |
| `API_PREFIX` | API route prefix | `/api` |

## Deployment Options

### Option 1: Railway (Recommended)

Railway offers easy deployment with automatic PostgreSQL provisioning.

#### Steps:

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

3. **Deploy via GitHub** (easiest):
   - Push your code to GitHub
   - In Railway dashboard, click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Dockerfile

4. **Add PostgreSQL**:
   - In your project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

5. **Configure environment variables**:
   - Go to your service → "Variables"
   - Add:
     ```
     NODE_ENV=production
     CORS_ORIGINS=https://your-frontend-domain.com
     API_PREFIX=/api
     ```

6. **Deploy**:
   - Railway automatically deploys on git push
   - Get your public URL from the "Settings" tab

#### Cost:
- Free tier: $5 credit/month
- Paid: Pay-as-you-go starting at $5/month

---

### Option 2: Render

Render provides free hosting for web services and PostgreSQL.

#### Steps:

1. **Create a Render account** at [render.com](https://render.com)

2. **Create PostgreSQL database**:
   - Dashboard → "New" → "PostgreSQL"
   - Choose free tier
   - Copy the "Internal Database URL"

3. **Create web service**:
   - Dashboard → "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `focusflow-api`
     - **Environment**: `Docker`
     - **Region**: Choose closest to your users
     - **Instance Type**: Free tier

4. **Set environment variables**:
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   CORS_ORIGINS=https://your-frontend-domain.com
   API_PREFIX=/api
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically

#### Cost:
- Free tier available (with limitations)
- Paid: Starting at $7/month

---

### Option 3: Heroku

Heroku is a classic PaaS with excellent PostgreSQL support.

#### Steps:

1. **Install Heroku CLI**:
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   heroku create focusflow-api
   ```

4. **Add PostgreSQL**:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGINS=https://your-frontend-domain.com
   heroku config:set API_PREFIX=/api
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

7. **Run migrations**:
   ```bash
   heroku run pnpm prisma migrate deploy
   ```

#### Cost:
- Free tier discontinued
- Paid: Starting at $7/month

---

### Option 4: Docker on VPS (DigitalOcean, AWS, etc.)

For full control, deploy using Docker on a VPS.

#### Steps:

1. **Set up a VPS** (Ubuntu 22.04 recommended)

2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**:
   ```bash
   sudo apt-get update
   sudo apt-get install docker-compose-plugin
   ```

4. **Clone your repository**:
   ```bash
   git clone <your-repo-url>
   cd focusflow-backend
   ```

5. **Create production `.env` file**:
   ```bash
   cp .env.example .env
   nano .env
   ```

   Update with production values:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://focusflow:your-secure-password@postgres:5432/focusflow?schema=public
   CORS_ORIGINS=https://your-frontend-domain.com
   API_PREFIX=/api
   ```

6. **Update `docker-compose.yml`** for production (change passwords!)

7. **Start services**:
   ```bash
   docker-compose up -d
   ```

8. **Run migrations**:
   ```bash
   docker-compose exec api npx prisma migrate deploy
   ```

9. **Set up Nginx reverse proxy** (optional but recommended):
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Set up SSL with Let's Encrypt**:
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d api.yourdomain.com
    ```

#### Cost:
- DigitalOcean: Starting at $6/month
- AWS Lightsail: Starting at $5/month

---

## Post-Deployment Checklist

After deploying, verify everything works:

- [ ] Health check: `curl https://your-api-domain.com/api/health`
- [ ] Create a project: Test with Postman or curl
- [ ] Check database: Verify data persists
- [ ] Test CORS: Make a request from your frontend
- [ ] Monitor logs: Check for errors
- [ ] Set up monitoring: Use platform's built-in tools or add Sentry
- [ ] Configure backups: Enable automatic database backups
- [ ] Update frontend: Point `REACT_APP_API_URL` to your production API

## Database Migrations

When you update the database schema:

1. **Create migration locally**:
   ```bash
   pnpm prisma migrate dev --name your_migration_name
   ```

2. **Commit the migration**:
   ```bash
   git add prisma/migrations
   git commit -m "Add migration: your_migration_name"
   git push
   ```

3. **Deploy to production**:
   - Railway/Render: Automatic on push
   - Heroku: `heroku run pnpm prisma migrate deploy`
   - Docker: `docker-compose exec api npx prisma migrate deploy`

## Monitoring and Maintenance

### Logging

- **Railway**: Built-in logs in dashboard
- **Render**: Built-in logs in dashboard
- **Heroku**: `heroku logs --tail`
- **Docker**: `docker-compose logs -f api`

### Database Backups

- **Railway**: Automatic daily backups
- **Render**: Manual backups in free tier, automatic in paid
- **Heroku**: `heroku pg:backups:capture`
- **Docker**: Set up automated PostgreSQL backups with `pg_dump`

### Performance Monitoring

Consider adding:
- [Sentry](https://sentry.io/) for error tracking
- [New Relic](https://newrelic.com/) for APM
- [DataDog](https://www.datadoghq.com/) for infrastructure monitoring

## Scaling

As your app grows:

1. **Vertical scaling**: Upgrade to larger instances
2. **Database optimization**: Add indexes, optimize queries
3. **Caching**: Add Redis for frequently accessed data
4. **Load balancing**: Deploy multiple instances behind a load balancer
5. **CDN**: Use Cloudflare or similar for static assets

## Troubleshooting

### Common Issues

**CORS errors**:
- Verify `CORS_ORIGINS` includes your frontend URL
- Check for trailing slashes in URLs

**Database connection errors**:
- Verify `DATABASE_URL` is correct
- Check if database is running
- Ensure IP whitelist includes your server (if applicable)

**Port already in use**:
- Change `PORT` environment variable
- Kill existing process: `lsof -ti:3001 | xargs kill`

**Prisma Client errors**:
- Regenerate client: `pnpm prisma generate`
- Run migrations: `pnpm prisma migrate deploy`

## Security Best Practices

1. **Use environment variables** for all secrets
2. **Enable HTTPS** (SSL/TLS) in production
3. **Keep dependencies updated**: `pnpm update`
4. **Implement rate limiting** (add `express-rate-limit`)
5. **Add authentication** when ready (JWT recommended)
6. **Use strong database passwords**
7. **Enable database connection pooling**
8. **Set up automated security scanning** (Dependabot, Snyk)

## Support

For deployment issues:
- Check platform-specific documentation
- Review server logs
- Test endpoints with curl or Postman
- Verify environment variables are set correctly
