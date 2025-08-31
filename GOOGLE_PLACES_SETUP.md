# Google Places API Setup Guide

## Overview
This hospital finder uses Google Places API as the primary data source for accurate, real-time hospital information. OpenStreetMap serves as a free fallback when Google Places API is not configured.

## Setup Instructions

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Places API)

### 2. Enable Places API
1. Navigate to "APIs & Services" > "Library"
2. Search for "Places API"
3. Click "Enable"

### 3. Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### 4. Restrict API Key (Recommended)
1. Click on your API key to edit
2. Under "API restrictions", select "Restrict key"
3. Choose "Places API"
4. Under "Application restrictions", add your domain

### 5. Configure Environment
1. Open `.env` file in project root
2. Replace `your-google-places-api-key-here` with your actual API key:
```
GOOGLE_PLACES_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwx
```

## API Usage & Costs

### Free Tier
- $200 monthly credit (covers ~40,000 requests)
- First 1000 requests per month are free

### Pricing (after free tier)
- Nearby Search: $32 per 1000 requests
- Place Details: $17 per 1000 requests

### Cost Optimization
- Results are cached for 1 hour
- Limited to 20km radius searches
- Maximum 15 results per search

## Fallback System
If Google Places API is not configured or fails:
- System automatically uses OpenStreetMap (100% free)
- No API key required for fallback
- Slightly less detailed information

## Testing
Test your setup:
```bash
GET http://localhost:5000/api/test-hospital-search
```

## Troubleshooting

### Common Issues
1. **"API key not valid"**: Check key is correct in .env file
2. **"This API project is not authorized"**: Enable Places API
3. **"Quota exceeded"**: Check billing account
4. **"REQUEST_DENIED"**: Verify API restrictions

### Support
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Pricing Calculator](https://cloud.google.com/maps-platform/pricing)