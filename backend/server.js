const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Signup_routes = require('./routes/Signup_route');
const corsOrigin = process.env.CORS_ORIGIN;
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Routes
app.use('/sign',Signup_routes);
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/faculty', require('./routes/facultyRoutes'));
// app.use('/api/student', require('./routes/studentRoutes'));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
