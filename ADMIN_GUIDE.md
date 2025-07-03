# 👨‍💼 Fyngan IMS - Administrator Guide

## 🔐 User Management & Database Administration

### Creating User Accounts

Since the app no longer allows self-registration, all user accounts must be created manually through the Supabase database.

#### Method 1: Using Supabase Dashboard (Recommended)

1. **Access Supabase Dashboard:**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your project
   - Navigate to "Authentication" > "Users"

2. **Create New User:**
   ```sql
   -- Click "Add User" or use SQL Editor
   -- In SQL Editor, run:
   
   -- Step 1: Create the auth user
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     confirmation_sent_at,
     created_at,
     updated_at,
     raw_app_meta_data,
     raw_user_meta_data
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'user@company.com', -- Replace with actual email
     crypt('temporary_password', gen_salt('bf')), -- Replace with secure password
     now(),
     now(),
     now(),
     now(),
     '{"provider": "email", "providers": ["email"]}',
     '{"name": "User Name"}' -- Replace with actual name
   );
   ```

3. **Add User Profile:**
   ```sql
   -- Step 2: Create user profile in your app's user table
   INSERT INTO users_fyngan2024 (
     id,
     email,
     name,
     role,
     phone,
     department,
     assigned_locations,
     is_active,
     created_at,
     updated_at
   ) VALUES (
     'user-auth-id-from-step-1', -- Use the ID from the auth user created above
     'user@company.com',
     'John Doe',
     'staff', -- Options: admin, manager, staff, viewer
     '+1234567890',
     'Operations',
     '{1,2}', -- Array of location IDs this user can access
     true,
     now(),
     now()
   );
   ```

#### Method 2: Using Supabase CLI

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login and Link Project:**
   ```bash
   supabase login
   supabase link --project-ref your-project-id
   ```

3. **Create User Script:**
   ```bash
   # Create a file: create_user.sql
   supabase db push
   ```

#### Method 3: Using Admin Panel (Future Enhancement)

You can create an admin panel within the app for easier user management:

```javascript
// Add this to your admin components
const createUser = async (userData) => {
  try {
    // This would require admin service account
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: userData.name
      }
    });

    if (error) throw error;

    // Then create profile
    await userService.updateProfile(data.user.id, {
      name: userData.name,
      role: userData.role,
      department: userData.department,
      phone: userData.phone
    });

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
```

### User Roles & Permissions

#### Available Roles:

1. **Admin** (`admin`)
   - Full system access
   - User management
   - All locations access
   - System settings

2. **Manager** (`manager`) 
   - Location management
   - Team oversight
   - Inventory control
   - Reports access

3. **Staff** (`staff`)
   - Basic inventory operations
   - Stock adjustments
   - Order creation
   - Limited reporting

4. **Viewer** (`viewer`)
   - Read-only access
   - View inventory
   - View reports
   - No modifications

#### Setting User Roles:

```sql
-- Update user role
UPDATE users_fyngan2024 
SET role = 'manager', 
    updated_at = now()
WHERE email = 'user@company.com';

-- Assign locations to user
UPDATE users_fyngan2024 
SET assigned_locations = '{1,2,3}', -- Array of location IDs
    updated_at = now()
WHERE email = 'user@company.com';
```

### Managing User Access

#### Activate/Deactivate Users:

```sql
-- Deactivate user
UPDATE users_fyngan2024 
SET is_active = false, 
    updated_at = now()
WHERE email = 'user@company.com';

-- Reactivate user
UPDATE users_fyngan2024 
SET is_active = true, 
    updated_at = now()
WHERE email = 'user@company.com';
```

#### Reset User Password:

```sql
-- In Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Find the user
-- 3. Click "Reset Password"
-- 4. User will receive email with reset link

-- Or via SQL (advanced):
UPDATE auth.users 
SET encrypted_password = crypt('new_password', gen_salt('bf')),
    updated_at = now()
WHERE email = 'user@company.com';
```

### Database Maintenance

#### Regular Cleanup Tasks:

```sql
-- Remove old audit logs (older than 1 year)
DELETE FROM audit_logs_fyngan2024 
WHERE created_at < now() - interval '1 year';

-- Clean up old notifications
DELETE FROM notifications_fyngan2024 
WHERE created_at < now() - interval '30 days' 
AND read_at IS NOT NULL;

-- Update user last_login timestamps
-- This happens automatically on login
```

#### Backup Procedures:

```bash
# Export user data
supabase db dump --data-only --table=users_fyngan2024 > users_backup.sql

# Export all inventory data
supabase db dump --data-only > full_backup.sql

# Restore from backup
supabase db reset
psql -h your-host -d your-db -f backup.sql
```

### Security Best Practices

#### Password Policies:
- Minimum 8 characters
- Require special characters
- Force password change every 90 days
- No password reuse

#### Access Control:
- Regular access reviews
- Remove inactive users
- Monitor login attempts
- Enable 2FA for admins

#### Database Security:
```sql
-- Row Level Security is enabled on all tables
-- Users can only see data they have access to

-- Example RLS policy for locations:
CREATE POLICY "Users can only see assigned locations" 
ON locations_fyngan2024 FOR SELECT 
USING (
  id = ANY(
    SELECT unnest(assigned_locations) 
    FROM users_fyngan2024 
    WHERE id = auth.uid()
  )
);
```

### Monitoring & Troubleshooting

#### Check User Status:
```sql
-- View all users and their status
SELECT 
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.last_login,
  array_length(u.assigned_locations, 1) as location_count
FROM users_fyngan2024 u
ORDER BY u.created_at DESC;
```

#### Monitor System Usage:
```sql
-- Check login activity
SELECT 
  email,
  last_login,
  created_at
FROM users_fyngan2024
WHERE last_login > now() - interval '7 days'
ORDER BY last_login DESC;

-- Check inventory activity
SELECT 
  table_name,
  operation,
  COUNT(*) as count
FROM audit_logs_fyngan2024
WHERE created_at > now() - interval '24 hours'
GROUP BY table_name, operation
ORDER BY count DESC;
```

### Common Administrative Tasks

#### 1. New Employee Onboarding:
```sql
-- 1. Create auth user (see Method 1 above)
-- 2. Create profile
-- 3. Assign to locations
-- 4. Set appropriate role
-- 5. Send credentials securely
```

#### 2. Employee Role Change:
```sql
UPDATE users_fyngan2024 
SET role = 'manager',
    assigned_locations = '{1,2,3}',
    updated_at = now()
WHERE email = 'promoted_user@company.com';
```

#### 3. Employee Departure:
```sql
-- Option 1: Deactivate (recommended for audit trail)
UPDATE users_fyngan2024 
SET is_active = false,
    updated_at = now()
WHERE email = 'departing_user@company.com';

-- Option 2: Complete removal (use with caution)
-- This will remove audit trail
DELETE FROM auth.users WHERE email = 'departing_user@company.com';
DELETE FROM users_fyngan2024 WHERE email = 'departing_user@company.com';
```

#### 4. Location Access Management:
```sql
-- Add location access
UPDATE users_fyngan2024 
SET assigned_locations = array_append(assigned_locations, 4),
    updated_at = now()
WHERE email = 'user@company.com';

-- Remove location access
UPDATE users_fyngan2024 
SET assigned_locations = array_remove(assigned_locations, 2),
    updated_at = now()
WHERE email = 'user@company.com';
```

### Emergency Procedures

#### Lost Admin Access:
```sql
-- Create emergency admin user
INSERT INTO users_fyngan2024 (id, email, name, role, is_active)
VALUES (
  'emergency-admin-id',
  'emergency@company.com',
  'Emergency Admin',
  'admin',
  true
);
```

#### System Recovery:
1. Check Supabase dashboard for errors
2. Review recent audit logs
3. Restore from backup if necessary
4. Contact Supabase support for critical issues

### Support Contacts

- **Supabase Support**: [support@supabase.com](mailto:support@supabase.com)
- **Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Community**: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

## 📞 Need Help?

If you need assistance with user management or encounter any issues:

1. Check the Supabase dashboard for error logs
2. Review the SQL queries in this guide
3. Contact your system administrator
4. Refer to the Supabase documentation

Remember to always backup your data before making significant changes to user accounts or permissions.