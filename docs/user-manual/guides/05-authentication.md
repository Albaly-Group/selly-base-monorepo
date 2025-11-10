# Authentication & Login

This guide covers logging in, managing your session, and logging out of Selly Base.

## Accessing the Platform

### Login Page

**URL:** `https://your-instance.selly.com/login` or `http://localhost:3000/login` (development)

The login page is your entry point to Selly Base.

📸 **Screenshot:** `all-auth-login-page-01.png`

### Login Process

**Step 1: Navigate to Login Page**
- Open your web browser
- Enter the Selly Base URL
- You'll be automatically redirected to the login page if not authenticated

**Step 2: Enter Your Credentials**

✅ **Email Address:**
- Enter your organization email address
- Example: `user@albaly.com`
- Email is case-insensitive

📸 **Screenshot:** `all-auth-email-filled-02.png`

✅ **Password:**
- Enter your password
- Password is case-sensitive
- Use the "Show/Hide" icon to verify your entry

📸 **Screenshot:** `all-auth-password-filled-03.png`

**Step 3: Sign In**
- Click the "Sign In" or "Login" button
- The system will validate your credentials
- You'll see a loading indicator during authentication

**Step 4: Successful Login**
- Upon successful authentication, you'll be redirected to the Dashboard
- A welcome message may appear
- Your user profile will be loaded

📸 **Screenshot:** `all-auth-login-success-04.png`

## User Credentials by Role

For testing and documentation purposes, here are the credential patterns:

### Platform Admin
- **Email:** `platform@albaly.com`
- **Role:** Platform Administrator
- **Access:** Complete platform access

### Customer Admin
- **Email:** `admin@{organization}.com`
- **Role:** Organization Administrator
- **Access:** Organization-level administration

### Staff
- **Email:** `staff@{organization}.com`
- **Role:** Staff Member
- **Access:** Data management and reporting

### User
- **Email:** `user@{organization}.com`
- **Role:** Regular User
- **Access:** Basic search and export

💡 **Tip:** Contact your organization administrator if you've forgotten your credentials.

## First-Time Login

If this is your first time logging in:

1. **Use Temporary Password:** You may receive a temporary password
2. **Password Reset:** You'll be prompted to create a new password
3. **Profile Setup:** Complete your user profile information
4. **Tour Available:** A guided tour may be offered

## Session Management

### Session Duration
- Sessions last for **24 hours** by default
- Activity extends your session automatically
- Idle timeout after **1 hour** of inactivity

### Session Indicator
Your session status is shown in the top-right corner:
- **Green dot:** Active session
- **Yellow dot:** Session expiring soon
- **Red dot:** Session expired

### Session Refresh
Sessions are refreshed automatically using refresh tokens:
- Seamless background refresh
- No interruption to your work
- Secure token rotation

## Access Control

### Access Denied

If you attempt to access a page without proper permissions:

📸 **Screenshot:** `all-auth-access-denied-01.png`

**What happens:**
- You'll see an "Access Denied" page
- Clear message explaining why access was denied
- Link to return to Dashboard
- Option to contact administrator

**Common reasons:**
- Insufficient permissions for the requested page
- Role doesn't have required permission
- Organization policy restriction
- Feature not available for your subscription

**What to do:**
- Review your role and permissions
- Contact your organization administrator
- Request permission if needed
- Check if you're using the correct account

### Multi-Factor Authentication (MFA)

⚠️ **Note:** MFA may be required based on organization policy.

If MFA is enabled:
1. Enter email and password
2. Receive verification code via email or authenticator app
3. Enter verification code
4. Complete login

## Logout Process

### How to Logout

**Method 1: User Menu**
1. Click your profile icon (top-right corner)
2. Select "Logout" or "Sign Out" from the menu
3. Confirm logout if prompted

**Method 2: Direct URL**
- Navigate to `/logout` URL
- Example: `https://your-instance.selly.com/logout`

📸 **Screenshot:** `all-auth-logout-page-05.png`

### Logout Confirmation

After logging out:
- You'll see a confirmation message
- Session is terminated immediately
- All temporary data is cleared
- You're redirected to the login page

### Automatic Logout

The system automatically logs you out when:
- Session expires (after 24 hours)
- Idle timeout is reached (1 hour)
- Password is changed
- Account is disabled by administrator
- Security policy requires re-authentication

## Security Best Practices

### Password Security
- **Strength:** Use strong, unique passwords (minimum 8 characters)
- **Complexity:** Include uppercase, lowercase, numbers, and symbols
- **Uniqueness:** Don't reuse passwords from other sites
- **Updates:** Change password every 90 days (if required)

### Session Security
- **Logout:** Always log out when using shared computers
- **Timeout:** Don't leave sessions unattended
- **Private Mode:** Use browser private/incognito mode on shared devices
- **Close Tabs:** Close all Selly Base tabs when done

### Account Security
- **Email:** Keep your registered email address current
- **Suspicious Activity:** Report unusual activity immediately
- **Phishing:** Be wary of fake login pages
- **Support:** Only share credentials with official support channels

## Troubleshooting Login Issues

### Cannot Login

**"Invalid credentials" error:**
- Verify email address is correct
- Check that password is entered correctly (case-sensitive)
- Ensure Caps Lock is off
- Try password reset if needed

**"Account locked" error:**
- Too many failed login attempts
- Wait 30 minutes or contact administrator
- Administrator can unlock account manually

**"Account disabled" error:**
- Account has been deactivated
- Contact your organization administrator
- May require reactivation

**"Session expired" error:**
- Your session has timed out
- Simply log in again
- Consider using "Remember Me" if available

### Password Reset

To reset your password:

1. Click "Forgot Password?" on login page
2. Enter your email address
3. Check email for reset link
4. Click the reset link (valid for 1 hour)
5. Enter new password (twice for confirmation)
6. Click "Reset Password"
7. Log in with new password

💡 **Tip:** Reset links expire after 1 hour for security.

### Browser Issues

If experiencing login problems:
- **Clear Cache:** Clear browser cache and cookies
- **Different Browser:** Try a different browser
- **Incognito Mode:** Test in private/incognito window
- **Update Browser:** Ensure browser is up to date
- **Disable Extensions:** Temporarily disable browser extensions

### Network Issues

If login page won't load:
- **Check Connection:** Verify internet connectivity
- **VPN:** Try with/without VPN
- **Firewall:** Check firewall settings
- **DNS:** Try different DNS servers

## Getting Help

If you continue to have issues:

1. **Check Status Page:** `https://status.selly.com`
2. **Contact Support:** support@selly.com
3. **Contact Administrator:** Your organization administrator
4. **Help Center:** `https://help.selly.com`

---

**Previous:** [Understanding Your Role ←](04-user-roles.md)  
**Next:** [Dashboard Overview →](06-dashboard.md)
