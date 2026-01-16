const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL successfully');

        // Check/Create table messages
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                institute VARCHAR(255),
                designation VARCHAR(255),
                demo_date VARCHAR(50),
                message TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create site_settings table (Key-Value store for config)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value JSON NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check/Create table jobs
        await connection.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                location VARCHAR(100),
                type VARCHAR(50),
                description TEXT,
                requirements TEXT,
                responsibilities TEXT,
                status ENUM('Draft', 'Published') DEFAULT 'Draft',
                isVisible BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check/Create table job_applications
        await connection.query(`
            CREATE TABLE IF NOT EXISTS job_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id INT,
                applicant_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),  -- Updated length based on migration
                resume_link VARCHAR(500),
                portfolio_link VARCHAR(500),
                cover_letter TEXT,
                status ENUM('Pending', 'Reviewed', 'Interviewed', 'Rejected', 'Hired') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
            )
        `);

        // Check/Create table for Employee Testimonials (Careers Page)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS employee_testimonials (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                position VARCHAR(255),
                tenure VARCHAR(255),
                testimonial TEXT,
                image LONGTEXT,
                status ENUM('Draft', 'Published') DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Dynamic Schema Migration (Fixing potential mismatches)
        try {
            const [appColumns] = await connection.query("SHOW COLUMNS FROM job_applications");
            const existingFields = appColumns.map(c => c.Field);

            // mapping of column_name -> definition
            const requiredColumns = {
                'applicant_name': "VARCHAR(255) NOT NULL",
                'resume_link': "VARCHAR(500)",
                'portfolio_link': "VARCHAR(500)",
                'cover_letter': "TEXT"
            };

            // 1. Handle name -> applicant_name rename specifically
            if (existingFields.includes('name') && !existingFields.includes('applicant_name')) {
                await connection.query("ALTER TABLE job_applications CHANGE COLUMN name applicant_name VARCHAR(255) NOT NULL");
                console.log("Migrated job_applications: name -> applicant_name");
                existingFields.push('applicant_name'); // mark as present
            }

            // 2. Add any other missing columns
            for (const [colName, colDef] of Object.entries(requiredColumns)) {
                if (!existingFields.includes(colName)) {
                    await connection.query(`ALTER TABLE job_applications ADD COLUMN ${colName} ${colDef}`);
                    console.log(`Migrated job_applications: Added missing column '${colName}'`);
                }
            }

            // 3. Fix: 'phone' column length if it exists but is short
            const phoneCol = appColumns.find(c => c.Field === 'phone');
            if (phoneCol && !phoneCol.Type.includes('50') && !phoneCol.Type.includes('255')) { // Check if not 50 or bigger
                await connection.query("ALTER TABLE job_applications MODIFY COLUMN phone VARCHAR(50)");
                console.log("Migrated job_applications: Increased phone column length");
            }

            // 4. Migrate employee_testimonials for missing 'tenure'
            const [storiesColumns] = await connection.query("SHOW COLUMNS FROM employee_testimonials");
            const storiesFields = storiesColumns.map(c => c.Field);
            if (!storiesFields.some(f => f.toLowerCase() === 'tenure')) {
                await connection.query("ALTER TABLE employee_testimonials ADD COLUMN tenure VARCHAR(255) AFTER position");
                console.log("Migrated employee_testimonials: Added missing column 'tenure'");
            }

            // 5. Add 'story' column to employee_testimonials
            if (!storiesFields.some(f => f.toLowerCase() === 'story')) {
                await connection.query("ALTER TABLE employee_testimonials ADD COLUMN story JSON AFTER testimonial");
                console.log("Migrated employee_testimonials: Added missing column 'story'");
            }

            // 5.1 Ensure 'image' column is LONGTEXT for employee_testimonials
            const imageCol = storiesColumns.find(c => c.Field === 'image');
            if (imageCol && imageCol.Type.toLowerCase() !== 'longtext') {
                await connection.query("ALTER TABLE employee_testimonials MODIFY COLUMN image LONGTEXT");
                console.log("Migrated employee_testimonials: Modified image column to LONGTEXT");
            }

            // 6. Migrate faqs table for missing fields (sort_order, etc.)
            const [faqColumns] = await connection.query("SHOW COLUMNS FROM faqs");
            const faqFields = faqColumns.map(c => c.Field);

            if (!faqFields.some(f => f.toLowerCase() === 'category')) {
                await connection.query("ALTER TABLE faqs ADD COLUMN category VARCHAR(100) AFTER answer");
                console.log("Migrated faqs: Added missing column 'category'");
            }

            if (!faqFields.some(f => f.toLowerCase() === 'sort_order')) {
                await connection.query("ALTER TABLE faqs ADD COLUMN sort_order INT DEFAULT 0");
                console.log("Migrated faqs: Added missing column 'sort_order'");
            }
            if (!faqFields.some(f => f.toLowerCase() === 'slug')) {
                await connection.query("ALTER TABLE faqs ADD COLUMN slug VARCHAR(255) AFTER question");
                console.log("Migrated faqs: Added missing column 'slug'");
            }
            if (!faqFields.some(f => f.toLowerCase() === 'status')) {
                await connection.query("ALTER TABLE faqs ADD COLUMN status VARCHAR(50) DEFAULT 'Published' AFTER slug");
                console.log("Migrated faqs: Added missing column 'status'");
            }
            if (!faqFields.some(f => f.toLowerCase() === 'metatitle')) {
                await connection.query("ALTER TABLE faqs ADD COLUMN metaTitle VARCHAR(255)");
                await connection.query("ALTER TABLE faqs ADD COLUMN metaDescription TEXT");
                await connection.query("ALTER TABLE faqs ADD COLUMN metaKeywords VARCHAR(255)");
                console.log("Migrated faqs: Added missing SEO columns");
            }

        } catch (migrationErr) {
            console.error('Schema migration warning:', migrationErr.message);
        }

        // Seed default Footer Config if not exists
        const [rows] = await connection.query('SELECT * FROM site_settings WHERE setting_key = ?', ['footer']);
        if (rows.length === 0) {
            const defaultFooter = {
                description: "Melzo is an Indian EdTech company delivering immersive digital learning solutions for schools and institutions. Through VR Labs and Interactive Learning Platforms, Melzo helps educators simplify operations and enhance student understanding using modern technology.",
                contact: {
                    phone: "+91 - 9687588818 / 9687488818",
                    address: "Ship Maitri House, Bhatar Char Rasta, opp. Shiv Dham Temple, Surat, Gujarat 395017"
                },
                socialLinks: [
                    { name: "LinkedIn", link: "https://linkedin.com/company/melzo", src: "/assets/linkedin.svg", isVisible: true },
                    { name: "Instagram", link: "https://instagram.com/melzo", src: "/assets/instagram.svg", isVisible: true },
                    { name: "X", link: "https://twitter.com/melzo", src: "/assets/twitter.svg", isVisible: true },
                    { name: "Email", link: "mailto:contact@melzo.com", src: "/assets/email.svg", isVisible: true }
                ],
                columns: [
                    {
                        title: "Explore Melzo Anubhav",
                        links: [
                            { label: "About Us", link: "/about", type: "internal", isVisible: true },
                            { label: "Case Study", link: "/casestudies", type: "internal", isVisible: true },
                            { label: "Blog", link: "/blog", type: "internal", isVisible: true },
                            { label: "Melzo in News", link: "/melzonews", type: "internal", isVisible: true }
                        ]
                    },
                    {
                        title: "Policies",
                        links: [
                            { label: "Terms of Services", link: "/terms", type: "internal", isVisible: true },
                            { label: "Privacy Policy", link: "/privacy-policy", type: "internal", isVisible: true },
                            { label: "Health & Safety", link: "/health-safety", type: "internal", isVisible: true }
                        ]
                    },
                    {
                        title: "Our Offerings",
                        links: [
                            { label: "Hardware Solutions", link: "/products/hardware", type: "internal", isVisible: true },
                            { label: "Software Solutions", link: "/products/software", type: "internal", isVisible: true },
                            { label: "Education & Training", link: "/products/education", type: "internal", isVisible: true },
                            { label: "Industrial & Enterprise", link: "/products/industrial", type: "internal", isVisible: true },
                            { label: "Defence Simulation", link: "/products/defence", type: "internal", isVisible: true },
                            { label: "Tourism", link: "/products/tourism", type: "internal", isVisible: true },
                            { label: "Emerging Applications", link: "/products/emerging", type: "internal", isVisible: true }
                        ]
                    }
                ]
            };
            await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['footer', JSON.stringify(defaultFooter)]);
            console.log('Default footer config seeded.');
        }

        // Seed default Data Strip Config if not exists
        const [stripRows] = await connection.query('SELECT * FROM site_settings WHERE setting_key = ?', ['data_strip']);
        if (stripRows.length === 0) {
            const defaultDataStrip = [
                "USED BY 120+ INSTITUTIONS ACROSS INDIA",
                "COVERS K-12 TO HIGHER EDUCATION & INDUSTRIAL TRAINING",
                "1,200+ STUDENTS IMPACTED PER LAB ANNUALLY",
                "WORKS WITH CSR, GOVERNMENT & PRIVATE INSTITUTIONS"
            ];
            await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['data_strip', JSON.stringify(defaultDataStrip)]);
            console.log('Default Data Strip config seeded.');
        }

        // Seed default Global Momentum Config if not exists
        const [momentumRows] = await connection.query('SELECT * FROM site_settings WHERE setting_key = ?', ['global_momentum']);
        if (momentumRows.length === 0) {
            const defaultGlobalMomentum = {
                marqueeItems: [
                    { text: "Innovation", status: 'Published' },
                    { text: "Immersive Learning", status: 'Published' },
                    { text: "Virtual Reality", status: 'Published' },
                    { text: "Augmented Reality", status: 'Published' },
                    { text: "Future of Work", status: 'Published' },
                    { text: "Education Revolution", status: 'Published' }
                ],
                stats: [
                    { num: '500+', label: 'Schools', status: 'Published' },
                    { num: '50K+', label: 'Students', status: 'Published' },
                    { num: '10+', label: 'Countries', status: 'Published' },
                    { num: '100%', label: 'Engagement', status: 'Published' }
                ]
            };
            await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['global_momentum', JSON.stringify(defaultGlobalMomentum)]);
            console.log('Default Global Momentum config seeded.');
        }

        // Seed default Careers Page Content if not exists
        const [careersRows] = await connection.query('SELECT * FROM site_settings WHERE setting_key = ?', ['careers_live']);
        if (careersRows.length === 0) {
            const defaultCareersContent = {
                hero: {
                    title: "We don't just build VR. We build Reality.",
                    subtitle: "If you thrive on big challenges, cutting-edge tech, and shaping the future of education and enterprise—this is your launchpad.",
                    button: "View Open Positions"
                },
                values: {
                    title: "What we seek in you",
                    subtitle: "Our culture is built on these four pillars.",
                    items: [
                        { title: "Innovation", desc: "We don't just follow trends, we set them. We architect systems that structure experience over memorization." },
                        { title: "Impact", desc: "We are on a mission to democratize education. Accessible, high-quality learning for everyone, everywhere." },
                        { title: "Empathy", desc: "We build for the learner. User experience isn't an afterthought, it's our foundation." },
                        { title: "Scale", desc: "Thinking big is in our DNA. We build solutions designed to reach millions of students." }
                    ]
                },
                perks: {
                    title: "Perks & Benefits",
                    items: [
                        { title: "Flexible Working Hours", desc: "The company offers flexible working hours to support better work-life balance." },
                        { title: "Bonuses & Rewards", desc: "There are performance-based bonuses and rewards for good work." },
                        { title: "Fun Culture", desc: "The workplace promotes a fun and friendly culture with team activities and events." },
                        { title: "Recreational Facilities", desc: "Employees have access to recreational and wellness facilities like games or fitness options." },
                        { title: "Learning & Growth", desc: "The environment encourages learning, innovation, and growth in emerging tech like VR and EdTech." },
                        { title: "Leaves & Encashment", desc: "Employees get paid leaves and leave encashment options." }
                    ]
                }
            };
            await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['careers_live', JSON.stringify(defaultCareersContent)]);
            console.log('Default Careers Content seeded.');
        }

        // Seed default Employee Testimonials if not exists
        const [storiesRows] = await connection.query('SELECT * FROM employee_testimonials');
        if (storiesRows.length === 0) {
            const defaultStories = [
                {
                    name: "Rahul Sharma",
                    position: "Senior Unity Developer",
                    tenure: "3+ Years at Melzo",
                    testimonial: "Working at Melzo has been an incredible journey. The freedom to experiment with new VR technologies and structural architectures is what keeps me motivated every day. We aren't just building apps; we are defining how education is consumed.",
                    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
                    status: 'Published'
                },
                {
                    name: "Priya Patel",
                    position: "Product Designer",
                    tenure: "2 Years at Melzo",
                    testimonial: "The collaborative culture and the focus on user empathy allow us to create experiences that truly impact students across India. Being part of a team that democratizes high-quality education through immersive tech is deeply rewarding.",
                    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
                    status: 'Published'
                }
            ];
            for (const story of defaultStories) {
                await connection.query(
                    'INSERT INTO employee_testimonials (name, position, tenure, testimonial, image, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [story.name, story.position, story.tenure, story.testimonial, story.image, story.status]
                );
            }
            console.log('Default Employee Testimonials seeded.');
        }

        // Seed default VR Tourism Page Content if not exists
        const [tourismRows] = await connection.query('SELECT * FROM site_settings WHERE setting_key = ?', ['vrTourism_live']);
        if (tourismRows.length === 0) {
            const defaultTourism = {
                hero: {
                    badge: "VR Tourism",
                    title: "Experience the World, No Passport Required",
                    subtitle: "Immersive Virtual Reality tours that transport you to heritage sites, museums, and natural wonders.",
                    primaryBtn: "Book a Demo",
                    secondaryBtn: "Explore Tours"
                },
                experience: {
                    title: "Redefining Travel & Heritage",
                    subtitle: "Bring history and culture to life with high-fidelity VR experiences.",
                    features: [
                        { number: "01", title: "Virtual Heritage", desc: "Preserve and showcase historical sites in digital twins." },
                        { number: "02", title: "Accessible Travel", desc: "Allow anyone, anywhere to visit remote or restricted locations." },
                        { number: "03", title: "Interactive Guides", desc: "AI-powered guides that provide deep context and stories." }
                    ]
                },
                stakeholders: {
                    title: "Who Benefits?",
                    subtitle: "Solutions for governments, museums, and travel agencies.",
                    items: [
                        { focus: "Governments", audience: "Tourism Boards", benefit: "Boost interest in local destinations globally." },
                        { focus: "Culture", audience: "Museums", benefit: "Expand reach beyond physical visitors." },
                        { focus: "Business", audience: "Travel Agencies", benefit: "Offer 'try before you buy' experiences." }
                    ]
                },
                whyMelzo: {
                    title: "Why Melzo VR Tourism?",
                    subtitle: "Leading the way in digital heritage preservation.",
                    stats: [
                        { value: "50+", label: "Heritage Sites" },
                        { value: "1M+", label: "Virtual Visitors" },
                        { value: "4K", label: "Resolution" }
                    ],
                    cta: "Partner With Us"
                }
            };
            await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['vrTourism_live', JSON.stringify(defaultTourism)]);
            console.log('Default VR Tourism Content seeded.');
        }

        // Seed default VR Industrial Page Content if not exists
        const [industrialRows] = await connection.query('SELECT * FROM site_settings WHERE setting_key = ?', ['vrIndustrial_live']);
        if (industrialRows.length === 0) {
            const defaultIndustrial = {
                hero: {
                    badge: "VR Industrial",
                    title: "Train Safer, Work Smarter",
                    subtitle: "Industrial safety and operations training in a risk-free virtual environment.",
                    primaryBtn: "Get Started",
                    secondaryBtn: "View Simulations"
                },
                industrialSuite: {
                    title: "Industrial Training Suite",
                    subtitle: "Comprehensive modules for heavy industry.",
                    features: [
                        { number: "01", title: "Safety Training", desc: "Simulate hazards and emergency response protocols." },
                        { number: "02", title: "Equipment Operation", desc: "Master heavy machinery without risk of damage or injury." },
                        { number: "03", title: "Maintenance Procedures", desc: "Step-by-step guides for complex repairs." }
                    ]
                },
                applications: {
                    title: "Key Applications",
                    features: [
                        { focus: "Safety", audience: "Hazard Awareness", benefit: "Reduce accidents by 80% through immersive drills." },
                        { focus: "Skills", audience: "Skill Development", benefit: "Accelerate learning curves for new recruits." },
                        { focus: "Compliance", audience: "Certification", benefit: "Automated tracking of training completion." }
                    ]
                },
                stats: {
                    title: "Impact by Numbers",
                    subtitle: "Quantifiable improvements in safety and efficiency.",
                    items: [
                        { value: "80%", label: "Retention Rate" },
                        { value: "0", label: "Training Accidents" },
                        { value: "40%", label: "Cost Reduction" }
                    ],
                    cta: "Deploy VR Training"
                }
            };
            await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', ['vrIndustrial_live', JSON.stringify(defaultIndustrial)]);
            console.log('Default VR Industrial Content seeded.');
        }

        // MIGRATION: Fix users table if it has the wrong schema (i.e. 'email' instead of 'username')
        try {
            const [uCols] = await connection.query("SHOW COLUMNS FROM users");
            const uFields = uCols.map(c => c.Field);
            // If we have 'email' but not 'username', it's the old schema. Drop it.
            // OR if we have 'password' instead of 'password_hash'
            if ((uFields.includes('email') && !uFields.includes('username')) || (uFields.includes('password') && !uFields.includes('password_hash'))) {
                console.log('Detected incompatible users table schema. Dropping and Recreating...');
                await connection.query('DROP TABLE users');
            }
        } catch (e) {
            // Table might not exist, ignore
        }

        // Check/Create table users (RBAC)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('superadmin', 'content_manager', 'sales', 'hr') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed SuperAdmin if not exists
        const [adminRows] = await connection.query('SELECT * FROM users WHERE role = ?', ['superadmin']);
        if (adminRows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                ['admin', hashedPassword, 'superadmin']
            );
            console.log('Default SuperAdmin user seeded (admin/admin123).');
        }

        // Seed Content Manager
        const [cmRows] = await connection.query('SELECT * FROM users WHERE role = ?', ['content_manager']);
        if (cmRows.length === 0) {
            const hashedPassword = await bcrypt.hash('contentmanager123', 10);
            await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                ['contentmanager', hashedPassword, 'content_manager']
            );
            console.log('Default Content Manager user seeded.');
        }

        // Seed HR
        const [hrRows] = await connection.query('SELECT * FROM users WHERE role = ?', ['hr']);
        if (hrRows.length === 0) {
            const hashedPassword = await bcrypt.hash('hr123', 10);
            await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                ['hr', hashedPassword, 'hr']
            );
            console.log('Default HR user seeded.');
        }

        // Seed Sales
        const [salesRows] = await connection.query('SELECT * FROM users WHERE role = ?', ['sales']);
        if (salesRows.length === 0) {
            const hashedPassword = await bcrypt.hash('sales123', 10);
            await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                ['sales', hashedPassword, 'sales']
            );
            console.log('Default Sales user seeded.');
        }

        // Check/Create table login_logs
        await connection.query(`
            CREATE TABLE IF NOT EXISTS login_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                username VARCHAR(50),
                role VARCHAR(50),
                ip_address VARCHAR(50),
                status ENUM('Success', 'Failed') DEFAULT 'Success',
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details TEXT
            )
        `);

        console.log('Database tables verified');

        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

module.exports = { connectDB, pool };
