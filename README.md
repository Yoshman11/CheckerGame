1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Environment**
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/checkers
JWT_SECRET=your-secret-key-here
PORT=3000
CLIENT_URL=http://localhost:5173
```

3. **Start MongoDB**
Make sure MongoDB is running locally on port 27017

4. **Run the Application**
```bash
npm run dev
```

The application will start at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
