# 🚀 AgileLens Deployment Guide

This guide will help you deploy AgileLens to production using Vercel and Supabase.

## 📋 Prerequisites

- GitHub account
- Vercel account
- Supabase account
- OpenRouter API account

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note your project URL and anon key from Settings > API
3. Go to the SQL Editor and run the database schema from `SETUP.md`

### 2. Set up Row Level Security

The database schema includes RLS policies, but verify they're enabled:

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'sprints', 'forecasts');
```

### 3. Create Edge Function

1. Go to Edge Functions in your Supabase dashboard
2. Create a new function called `generate-forecast`
3. Copy the code from `SETUP.md` into the function
4. Deploy the function

## 🌐 Frontend Deployment

### 1. Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these in Vercel dashboard under Settings > Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

### 2. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Add your custom domain
3. Configure DNS records as instructed

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI features | Yes |

### Supabase Configuration

1. **Authentication Settings**
   - Go to Authentication > Settings
   - Configure allowed redirect URLs
   - Enable email confirmations if needed

2. **Database Settings**
   - Ensure RLS policies are active
   - Set up database backups
   - Configure connection pooling if needed

## 🚀 Production Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Edge functions deployed
- [ ] RLS policies enabled
- [ ] Authentication configured
- [ ] Domain configured (if using custom domain)

### After Deployment

- [ ] Test user registration/login
- [ ] Test sprint creation
- [ ] Test CSV import
- [ ] Test AI forecasting
- [ ] Test team management
- [ ] Verify all features work
- [ ] Set up monitoring

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. Monitor performance metrics
3. Set up alerts for errors

### Supabase Monitoring

1. Monitor database performance
2. Set up alerts for high usage
3. Track API usage

### Application Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring
- User analytics

## 🔒 Security Considerations

### Database Security

- RLS policies are enabled
- API keys are secure
- Database backups are configured

### Application Security

- HTTPS is enforced
- CORS is properly configured
- Input validation is in place

### API Security

- Rate limiting on Edge Functions
- API key rotation
- Secure environment variables

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check RLS policies
   - Ensure database is accessible

3. **AI Features Not Working**
   - Verify OpenRouter API key
   - Check Edge Function deployment
   - Monitor API usage limits

4. **Authentication Issues**
   - Check redirect URLs
   - Verify email settings
   - Check RLS policies for users table

### Debug Mode

Enable debug mode by setting:
```env
VITE_DEBUG=true
```

This will show additional console logs for debugging.

## 📈 Performance Optimization

### Frontend

- Enable Vercel's edge caching
- Optimize images and assets
- Use CDN for static files

### Backend

- Enable connection pooling
- Optimize database queries
- Use Supabase's caching features

### Monitoring

- Set up performance monitoring
- Track Core Web Vitals
- Monitor API response times

## 🔄 Updates & Maintenance

### Regular Updates

1. **Dependencies**
   - Update npm packages regularly
   - Test updates in staging first
   - Monitor for security vulnerabilities

2. **Database**
   - Regular backups
   - Monitor performance
   - Update RLS policies as needed

3. **Application**
   - Deploy updates through Vercel
   - Test thoroughly before production
   - Monitor for errors

### Backup Strategy

1. **Database Backups**
   - Supabase handles automatic backups
   - Consider additional manual backups for critical data

2. **Code Backups**
   - GitHub provides code backup
   - Consider additional repository mirrors

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Vercel and Supabase documentation
3. Check GitHub issues
4. Contact support if needed

## 🎉 Success!

Your AgileLens application should now be live and ready for users!

- **Frontend**: `https://your-project.vercel.app`
- **Database**: Supabase dashboard
- **Monitoring**: Vercel and Supabase dashboards

Remember to:
- Monitor usage and performance
- Keep dependencies updated
- Backup important data
- Test new features thoroughly

Happy sprint planning! 🚀
