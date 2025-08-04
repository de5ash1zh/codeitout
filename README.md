# Backend Implementation for CodeItOut

This repository contains the backend implementation for CodeItOut, a user authentication system built with Node.js, Express, Prisma, and PostgreSQL.

## Flow of Execution

### 1. **Database Setup**

- **Schema Definition**: The database schema is defined in [`prisma/schema.prisma`](prisma/schema.prisma).
  ```prisma
  model User {
    id        String   @id @default(uuid())
    email     String   @unique
    password  String
    role      UserRole @default(USER)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```
- **Migration**: The schema is migrated to PostgreSQL using Prisma migrations.

### 2. **Database Connection**

- **Prisma Client**: The Prisma client is initialized in [`src/libs/db.js`](src/libs/db.js).
  ```javascript
  import { PrismaClient } from "../generated/prisma/index.js";
  export const db = globalThis.prisma || new PrismaClient();
  ```

### 3. **Express Server**

- **Initialization**: The server is set up in [`src/index.js`](src/index.js).
  ```javascript
  import express from "express";
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", authRoutes);
  app.listen(port, () => console.log(`serving on port: ${port}`));
  ```

### 4. **Authentication Routes**

- **Routes**: Authentication routes are defined in [`src/routes/auth.routes.js`](src/routes/auth.routes.js).
  ```javascript
  authRoutes.post("/register", register);
  authRoutes.post("/login", login);
  authRoutes.post("/logout", authMiddleware, logout);
  authRoutes.get("/check", authMiddleware, check);
  ```

### 5. **Authentication Middleware**

- **JWT Verification**: Middleware verifies the JWT token and fetches the user from the database in [`src/middleware/auth.middleware.js`](src/middleware/auth.middleware.js).
  ```javascript
  const user = await db.user.findUnique({ where: { id: decoded.id } });
  if (!user) return res.status(404).json({ message: "User not found" });
  req.user = user;
  next();
  ```

### 6. **Authentication Controller**

- **Register**: Creates a new user and sets a JWT cookie.
  ```javascript
  const newUser = await db.user.create({
    data: { email, password: hashedPassword },
  });
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, { httpOnly: true });
  ```
- **Login**: Verifies user credentials and sets a JWT cookie.
  ```javascript
  const isMatch = await bcrypt.compare(password, user.password);
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, { httpOnly: true });
  ```
- **Logout**: Clears the JWT cookie.
  ```javascript
  res.clearCookie("jwt", { httpOnly: true });
  ```
- **Check**: Returns the authenticated user's details.
  ```javascript
  res.status(200).json({ user: req.user });
  ```

### 7. **Admin Role Verification Middleware**

- **Admin Check**: Middleware verifies if the authenticated user has an `ADMIN` role in [`src/middleware/auth.middleware.js`](src/middleware/auth.middleware.js).
  ```javascript
  const userId = req.user.id;
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied - Admins Only",
    });
  }
  next();
  ```

## Key Features

- **User Authentication**: Register, login, logout, and check authentication status.
- **JWT-Based Security**: Secure user sessions using JSON Web Tokens.
- **Role Management**: User roles (`ADMIN`, `USER`) defined in the schema.

## How to Run

1. Install dependencies: `npm install`
2. Run the server `npm run dev`
3. Access the API at `http://localhost:3000/api/v1/auth`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: Secret key for JWT.

For more details, refer to the code files linked above.
