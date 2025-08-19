# Environment setup

Create a `.env.local` file in the project root with:

```
MONGODB_URI=mongodb://127.0.0.1:27017/restaurant
JWT_SECRET=change_me_super_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Super admin bootstrap credentials (used by /api/auth/seed-super-admin)
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=super@admin.com
SUPER_ADMIN_PASSWORD=yourStrongPassword123
```

Then seed the super admin once:

```
POST http://localhost:3000/api/auth/seed-super-admin
```


