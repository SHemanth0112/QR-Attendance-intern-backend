# MongoDB Atlas Setup Instructions

## Your MongoDB Connection String

Your MongoDB Atlas connection string is:
```
mongodb+srv://hemanthkumarsurisetti_db_user:<db_password>@qr.ba5pjfg.mongodb.net/qr-attendance?retryWrites=true&w=majority
```

## Setup Steps

### 1. Create/Update the `.env` file

In the `backend` folder, create or update the `.env` file with the following content:

```env
PORT=5000
MONGODB_URI=mongodb+srv://hemanthkumarsurisetti_db_user:<db_password>@qr.ba5pjfg.mongodb.net/qr-attendance?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 2. Replace `<db_password>`

**IMPORTANT:** Replace `<db_password>` with your actual MongoDB Atlas database password.

For example, if your password is `MyPassword123`, the connection string should be:
```
mongodb+srv://hemanthkumarsurisetti_db_user:MyPassword123@qr.ba5pjfg.mongodb.net/qr-attendance?retryWrites=true&w=majority
```

### 3. URL Encoding Special Characters

If your password contains special characters like `@`, `#`, `$`, `%`, etc., you need to URL encode them:

- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `:` becomes `%3A`
- `/` becomes `%2F`

Example: If password is `Pass@123`, use `Pass%40123`

### 4. Verify Connection

Once you've updated the `.env` file with your actual password, start the backend server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

## MongoDB Atlas Security Notes

1. **Keep your password secure**: Never commit the `.env` file to Git (it's already in `.gitignore`)
2. **IP Whitelist**: Make sure your IP address is whitelisted in MongoDB Atlas:
   - Go to MongoDB Atlas Dashboard
   - Click "Network Access"
   - Add your current IP or use `0.0.0.0/0` for development (allows all IPs)

3. **Database User**: Ensure the user `hemanthkumarsurisetti_db_user` has the necessary permissions:
   - Go to "Database Access"
   - Verify the user exists and has "Read and Write" permissions

## Troubleshooting

### Error: "Authentication failed"
- Double-check your password
- Ensure no special characters are unencoded
- Verify the database user exists in MongoDB Atlas

### Error: "Network timeout" or "Connection refused"
- Check your internet connection
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Try adding `0.0.0.0/0` to allow all IPs (for development only)

### Error: "Database not found"
- The database `qr-attendance` will be created automatically when you first insert data
- No action needed - it will be created on first user registration

## Benefits of MongoDB Atlas

✅ No local MongoDB installation needed
✅ Automatic backups
✅ Cloud-hosted and always available
✅ Free tier available
✅ Scalable and secure
✅ Access from anywhere

## Connection String Format

The connection string format is:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?<options>
```

Your details:
- **Username**: `hemanthkumarsurisetti_db_user`
- **Cluster**: `qr.ba5pjfg.mongodb.net`
- **Database**: `qr-attendance`
- **Options**: `retryWrites=true&w=majority`

