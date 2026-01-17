const { pool } = require('../config/db');

const initialIndustries = [
    {
        title: 'Education',
        slug: 'education',
        summary: 'Curriculum-aligned VR labs for Science, Math, History, Geography.',
        impact: 'Improve student retention rates by up to 75% and save 60% on physical lab infrastructure.',
        details: '• K-12 Integration\n• STEM Labs\n• Teacher Training',
        modalTitle: 'Virtual Reality Solutions for Schools, Colleges & Training Institutes',
        fullSummary: 'Melzo designs VR solutions for education in India that support classroom learning, lab-based subjects, and skill development programs.',
        targetAudience: 'K–12 schools (CBSE, ICSE, State Boards)\nJunior colleges and degree colleges\nITIs, polytechnics, and vocational institutes\nEdTech and digital learning centers',
        problemsSolved: 'Limited physical lab access\nSafety risks in experiments\nLow student engagement\nConcept memorization without understanding',
        useCases: 'LAB|Science lab simulations|Conduct virtual experiments safely without physical lab constraints\nMATH|Mathematics and geometry visualization|Visualize complex 3D shapes and mathematical concepts interactively\nEXPLORE|History and geography immersion|Explore historical events and geographical locations in immersive VR\nCAREER|Career and skill exploration|Experience different careers and develop practical skills virtually',
        statsString: '120+|Schools\n50K+|Students\n75%|Better Retention',
        tags: 'K-12, STEM, Labs',
        image: '/images/education_modal_vr.webp',
        status: 'Published',
        isVisible: true
    },
    {
        title: 'CSR & Foundations',
        slug: 'csr',
        summary: 'Measurable impact, scalable deployment, and comprehensive reporting support.',
        impact: 'Directly reached 15,000+ beneficiaries in rural sectors with quantifiable skill improvements.',
        details: '• Rural Development\n• Skill Alignment\n• Impact Reports',
        modalTitle: 'CSR Impact through Immersive Tech',
        fullSummary: 'Empowering foundations to deliver scalable training and development in rural and underserved areas.',
        targetAudience: 'Corporate CSR Initiatives\nNGOs and Foundations\nRural Development Programs',
        problemsSolved: 'Logistical challenges in remote training\nDifficulty in measuring impact\nScalability of skilled trainers',
        useCases: 'SKILL | Vocational Training | Immersive modules for welding, carpentry, and electrical work\nHEALTH | Hygiene Awareness | Interactive simulations showing importance of sanitation\nFARM | Agricultural Best Practices | Virtual demonstrations of modern farming techniques\nSAFETY | Disaster Preparedness | Emergency response training for communities',
        statsString: '15K+ | Beneficiaries\n50+ | Villages Reached\n40% | Faster Learning',
        tags: 'Impact, Scale, Social Good',
        image: '/images/csr-bg.webp',
        status: 'Published',
        isVisible: true
    },
    {
        title: 'Government & Public Sector',
        slug: 'government',
        summary: 'Skill development, safety training, and immersive awareness programs.',
        impact: 'Standardized training for 50,000+ personnel with zero safety incidents during simulation.',
        details: '• Public Safety\n• Urban Planning\n• Civic Awareness',
        modalTitle: 'Government Solutions for Skilling & Safety',
        fullSummary: 'Providing standardized, high-quality training and awareness modules for public sector departments and civic bodies.',
        targetAudience: 'Safety Departments (Fire, Police)\nUrban Planning Bodies\nSkill Development Missions\nCivic Awareness Drives',
        problemsSolved: 'High cost of live training drills\nRisk to personnel during safety training\nLack of standardized training across regions',
        useCases: 'FIRE | Fire Safety Drills | Realistic fire fighting simulations without real fire risks\nTRAFFIC | Traffic Management | Simulations for traffic police training\nCIVIC | Waste Management | Education on segregation and processing for citizens\nURBAN | City Planning Visualization | Visualizing infrastructure projects before construction',
        statsString: '50K+ | Personnel Trained\n0 | Safety Incidents\n100% | Standardization',
        tags: 'Skilling, Safety, Civic',
        image: '/images/government-bg.webp',
        status: 'Published',
        isVisible: true
    },
    {
        title: 'Industry & Defence',
        slug: 'defence',
        summary: 'Simulation-based training with reduced risk and cost for mission-critical operations.',
        impact: 'Reduced training costs by 40% while increasing scenario exposure by 300%.',
        details: '• Tactical Sims\n• Equipment Handling\n• Strategy Planning',
        modalTitle: 'Advanced Simulation for Defence & Industry',
        fullSummary: 'High-fidelity simulations for critical operations, ensuring readiness and reducing training overheads.',
        targetAudience: 'Defence Forces\nHeavy Industries\nManufacturing Plants\nAviation & Aerospace',
        problemsSolved: 'Expensive equipment wear and tear\nRisk to life in live combat/industrial drills\nLimited availability of training scenarios',
        useCases: 'TACTICAL | Combat Scenarios | Mission planning and execution in virtual terrain\nMAINTENANCE | Heavy Machinery Repair | Step-by-step repair guides for complex engines\nFLIGHT | Drone/Flight Sims | Pilot training without risking expensive aircraft\nHAZARD | Industrial Safety | navigating hazardous environments safely',
        statsString: '40% | Cost Reduction\n300% | Scenario Exposure\n24/7 | Training Availability',
        tags: 'Simulation, Tactical, Training',
        image: '/images/defence-bg.webp',
        status: 'Published',
        isVisible: true
    }
];

async function setupIndustriesTable() {
    try {
        console.log('Creating industries table...');

        // Create table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS industries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                summary TEXT,
                impact TEXT,
                details TEXT,
                modalTitle VARCHAR(255),
                fullSummary TEXT,
                targetAudience TEXT,
                problemsSolved TEXT,
                useCases TEXT,
                statsString TEXT,
                tags VARCHAR(255),
                image VARCHAR(500),
                status ENUM('Draft', 'Published') DEFAULT 'Published',
                isVisible BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('industries table created successfully.');

        // Seed Data
        console.log('Seeding initial industries...');
        for (const item of initialIndustries) {
            // Check if exists
            const [existing] = await pool.query('SELECT id FROM industries WHERE slug = ?', [item.slug]);
            if (existing.length === 0) {
                await pool.query(`
                    INSERT INTO industries (title, slug, summary, impact, details, modalTitle, fullSummary, targetAudience, problemsSolved, useCases, statsString, tags, image, status, isVisible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    item.title, item.slug, item.summary, item.impact, item.details,
                    item.modalTitle || '', item.fullSummary || '',
                    item.targetAudience || '', item.problemsSolved || '',
                    item.useCases || '', item.statsString || '',
                    item.tags || '', item.image, item.status, item.isVisible
                ]);
                console.log(`Seeded: ${item.title}`);
            } else {
                console.log(`Skipped (Exists): ${item.title}`);
            }
        }

        console.log('Seeding complete.');
        process.exit(0);

    } catch (err) {
        console.error('Error setting up industries table:', err);
        process.exit(1);
    }
}

setupIndustriesTable();
