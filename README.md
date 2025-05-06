# SDLC Calendar

A calendar application for managing SDLC activities.

## MongoDB Atlas Setup Instructions

### 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new organization if prompted

### 2. Create a New Project

1. Name it "sdlc-calendar"
2. Click "Create Project"

### 3. Create a Free Cluster

1. Click "Build a Database"
2. Select "FREE" tier (M0 Sandbox)
3. Choose a cloud provider (AWS, GCP, or Azure) and region
4. Name your cluster "calendar-cluster"
5. Click "Create"

### 4. Set Up Database Access

1. In the security section, click "Database Access"
2. Click "Add New Database User"
3. Create a username and password (save these securely)
4. Set privileges to "Read and Write to any database"
5. Click "Add User"

### 5. Set Up Network Access

1. In the security section, click "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for development only)
4. Click "Confirm"

### 6. Get Your Connection String

1. Go back to your cluster and click "Connect"
2. Select "Connect your application"
3. Copy the connection string (it will look like `mongodb+srv://username:<password>@calendar-cluster.mongodb.net/?retryWrites=true&w=majority`)
4. Replace `<password>` with your actual password

### 7. Configure Your Application

1. Create a `.env.local` file in the root of your project
2. Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@calendar-cluster.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `username` and `password` with your MongoDB Atlas credentials

## Running the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Future Migration to Azure Cosmos DB

When you're ready to migrate to Azure Cosmos DB:

1. Create an Azure Cosmos DB account with MongoDB API
2. Get the connection string from Azure
3. Update your `.env.local` file with the new connection string

The code structure is designed to make this transition seamless since Azure Cosmos DB supports the MongoDB API.
