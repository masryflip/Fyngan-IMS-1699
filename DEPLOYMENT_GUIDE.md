# Fyngan IMS - Production Deployment Guide

## 🚀 Quick Start for Production

### Option 1: Deploy to Vercel (Recommended - Free & Easy)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial Fyngan IMS setup"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect React and deploy
   - Your app will be live at: `https://your-app-name.vercel.app`

### Option 2: Deploy to Netlify (Alternative)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop the `dist` folder to deploy
   - Or connect your GitHub repo for auto-deployment

### Option 3: Deploy to Your Own Server

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload to your web server:**
   - Upload the `dist` folder contents to your web server
   - Configure your server to serve the `index.html` for all routes

## 🔧 Configuration for Your Team

### 1. Customize Company Information

Edit these files to match your business:

**src/config/companyConfig.js** (Create this file):
```javascript
export const companyConfig = {
  name: "Your Company Name",
  logo: "/your-logo.png", // Replace logo.png in public folder
  primaryColor: "#your-brand-color", // Update in tailwind.config.js
  locations: [
    {
      id: 1,
      name: "Main Office",
      address: "Your Address",
      manager: "Manager Name",
      phone: "Your Phone"
    }
    // Add your actual locations
  ]
};
```

### 2. Update Branding

**Replace Logo:**
- Replace `public/logo.png` with your company logo
- Ensure it's 512x512px for best quality

**Update Colors:**
- Edit `tailwind.config.js` to change the coffee theme to your brand colors
- Update the primary color in `src/config/questConfig.js`

**Update App Title:**
- Edit `index.html` title and meta tags
- Update company name throughout the app

### 3. Set Up User Authentication

The app uses Quest Labs for authentication. To customize:

**Update Quest Configuration:**
```javascript
// src/config/questConfig.js
export default {
  QUEST_ONBOARDING_QUESTID: 'your-quest-id',
  USER_ID: 'your-user-id',
  APIKEY: 'your-api-key',
  TOKEN: 'your-token',
  ENTITYID: 'your-entity-id',
  PRIMARY_COLOR: '#your-color'
};
```

Contact Quest Labs to get your own credentials.

## 👥 Team Setup Instructions

### For Team Members:

1. **Access the App:**
   - Go to your deployed URL
   - Use the login page to create accounts

2. **First-Time Setup:**
   - Complete the onboarding process
   - Set up your profile and preferences

3. **Role Assignment:**
   - Admin users can assign roles in Team Management
   - Available roles: Admin, Manager, Staff, Viewer

### Admin Setup:

1. **Initial Admin Account:**
   - First user to register becomes admin
   - Or manually set role in the database

2. **Add Team Members:**
   - Go to Team Management
   - Add users and assign appropriate roles
   - Assign location access permissions

3. **Configure Locations:**
   - Go to Locations page
   - Add your actual business locations
   - Set up managers and contact info

4. **Set Up Inventory:**
   - Go to Inventory page
   - Add your actual products/items
   - Set stock levels for each location
   - Configure suppliers and categories

## 📊 Data Management

### Initial Data Setup:

1. **Clean Sample Data:**
   ```javascript
   // src/context/InventoryContext.jsx
   // Replace the initialState with your actual data
   const initialState = {
     locations: [], // Your actual locations
     items: [],     // Your actual inventory
     users: [],     // Will be populated as team joins
     // ... rest of the initial state
   };
   ```

2. **Import Existing Data:**
   - Create CSV import functionality
   - Or manually add through the UI
   - Use the "Add Item" and "Add Location" features

### Data Backup:

- Data is automatically saved to localStorage
- For production, consider adding database integration
- Export features are available in Reports section

## 🔒 Security Considerations

### Environment Variables:

Create `.env` file for sensitive data:
```env
VITE_QUEST_API_KEY=your_api_key
VITE_QUEST_ENTITY_ID=your_entity_id
# Add other sensitive config here
```

### Access Control:

- Set up proper user roles and permissions
- Regularly review team access
- Remove inactive users promptly

## 📱 Mobile Optimization

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

Team members can access it from any device with a web browser.

## 🆘 Support & Maintenance

### Regular Tasks:

1. **Weekly:**
   - Review user access and permissions
   - Check and update inventory levels
   - Process pending orders and transfers

2. **Monthly:**
   - Review reports and analytics
   - Update supplier information
   - Backup important data

3. **As Needed:**
   - Add new team members
   - Update location information
   - Adjust stock thresholds

### Getting Help:

- Check the built-in help documentation
- Contact support through the app
- Review this deployment guide
- Check GitHub issues for common problems

## 🔄 Updates and Maintenance

### Updating the App:

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Install updates:**
   ```bash
   npm install
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```

4. **Deploy updates:**
   - Vercel/Netlify will auto-deploy from GitHub
   - Or manually build and upload

### Monitoring Usage:

- Monitor user activity in Team Management
- Review inventory reports regularly
- Track system performance

---

## 🎉 You're Ready!

Your Fyngan IMS is now ready for production use. Your team can start managing inventory across multiple locations with real-time tracking, automated alerts, and comprehensive reporting.

**Next Steps:**
1. Deploy using one of the options above
2. Customize with your company branding
3. Add your team members
4. Set up your actual locations and inventory
5. Start managing your business efficiently!