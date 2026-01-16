const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Import routes
const messageRoutes = require('./routes/messageRoutes');
const footerRoutes = require('./routes/footerRoutes');
const blogRoutes = require('./routes/blogRoutes');
const newsRoutes = require('./routes/newsRoutes');
const caseStudyRoutes = require('./routes/caseStudyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running with MySQL!' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', messageRoutes);
app.use('/api', footerRoutes);
app.use('/api', blogRoutes);
app.use('/api', newsRoutes);
app.use('/api', require('./routes/dataStripRoutes'));
app.use('/api', caseStudyRoutes);
app.use('/api', require('./routes/awardsRoutes'));
app.use('/api', require('./routes/faqRoutes'));
app.use('/api', require('./routes/teamRoutes'));
app.use('/api', require('./routes/testimonialRoutes'));
app.use('/api', require('./routes/timelineRoutes'));
app.use('/api', require('./routes/jobRoutes'));
app.use('/api/employee-testimonials', require('./routes/employeeTestimonialRoutes'));
app.use('/api/global-momentum', require('./routes/globalMomentumRoutes'));
app.use('/api/page-content', require('./routes/pageContentRoutes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const { startAutoSync } = require('./services/googleDocSyncService');

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Start Auto Sync (every 5 minutes)
    startAutoSync(5);
});
