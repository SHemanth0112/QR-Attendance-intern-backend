# Fix MongoDB Authentication Error

## Current Error
```
❌ MongoDB connection error: MongoServerError: bad auth : authentication failed
```

## What This Means
✅ Connection string is correct  
✅ MongoDB Atlas is reachable  
❌ **Username or password is WRONG**

---

## SOLUTION 1: Verify Your Current Password (Quick)

1. Go to https://cloud.mongodb.com
2. Click your project
3. Go to **"Database Access"** (left sidebar)
4. Look for user: `hemanthkumarsurisetti_db_user`
5. Click **"Edit"** → **"Edit Password"**
6. Either:
   - Confirm password is `Hemanth@01`, OR
   - **Reset the password** to something you know

**If you reset the password:**
- Update the `.env` file with the new password
- Remember to URL encode special characters:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`

---

## SOLUTION 2: Create a New Test User (Recommended)

### Step 1: Create New User in MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Select your project
3. Click **"Database Access"** (left sidebar)
4. Click **"Add New Database User"** (green button)
5. Fill in:
   ```
   Authentication Method: Password
   Username: qr_admin
   Password: admin123
   ```
6. Under **"Database User Privileges"**, select:
   - **"Built-in Role"**: `Read and write to any database`
7. Click **"Add User"**
8. Wait 1-2 minutes for the user to be created

### Step 2: Update Your .env File

Open `backend/.env` and change the MONGODB_URI line to:

```
MONGODB_URI=mongodb+srv://qr_admin:admin123@qr.ba5pjfg.mongodb.net/qr-attendance?retryWrites=true&w=majority
```

### Step 3: Restart Server

The server should auto-restart with nodemon, or press `Ctrl+C` and run:
```bash
npm run dev
```

---

## SOLUTION 3: Use Auto-Generated Password

### Step 1: In MongoDB Atlas

1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `qr_user`
4. Click **"Autogenerate Secure Password"** button
5. **COPY THE PASSWORD** (you won't see it again!)
6. Save it somewhere safe
7. Database privileges: `Read and write to any database`
8. Click **"Add User"**

### Step 2: Update .env

Use the copied password in your `.env` file:

```
MONGODB_URI=mongodb+srv://qr_user:PASTE_COPIED_PASSWORD_HERE@qr.ba5pjfg.mongodb.net/qr-attendance?retryWrites=true&w=majority
```

If password has special characters, URL encode them!

---

## Quick Test Template

For testing purposes, use this simple configuration:

**MongoDB Atlas:**
- Username: `testuser`
- Password: `test1234` (no special characters)
- Privileges: Read and write to any database

**In .env:**
```
MONGODB_URI=mongodb+srv://testuser:test1234@qr.ba5pjfg.mongodb.net/qr-attendance?retryWrites=true&w=majority
```

---

## Checklist Before Testing

- [ ] Database user exists in MongoDB Atlas
- [ ] User has "Read and write" permissions
- [ ] Password is correct
- [ ] Special characters in password are URL encoded
- [ ] IP address is whitelisted (Network Access)
- [ ] Waited 1-2 minutes after creating user

---

## Common Password Encoding Examples

| Original Password | Encoded Password |
|------------------|-----------------|
| Pass@123         | Pass%40123      |
| Test#456         | Test%23456      |
| My$ecure         | My%24ecure      |
| User@Pass#123    | User%40Pass%23123 |
| Simple123        | Simple123       |

---

## After Fixing

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

## Still Not Working?

1. Make sure you're editing the correct `.env` file in the `backend` folder
2. Ensure the user was created successfully in MongoDB Atlas
3. Try a simple password without special characters first
4. Check IP whitelist includes your IP or `0.0.0.0/0`
5. Wait 1-2 minutes after creating a new user

