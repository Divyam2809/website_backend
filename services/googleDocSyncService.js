const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Google Doc IDs
const DOC_IDS = {
    TOURISM: '18biLhcxvncanh3157VQU-p_cnFANF04AjTWHthGT79w',
    DRONE: '1ZObaVzEu0ohvST0uXCJBokLMHIU9J6s2mCRq4lX00Bs',
    DEFENCE: '1yr_DV0NpbhGAkL0lpIRhnwryOIZjI6uUynXjAapLIBA',
    INDUSTRIAL: '1IHsmVU-18EI43b-nq6Py3FXASzgp8eqA84--oZAdEJw', // MELA
    VRLAB: '1AvxmahzbQrgae1PCqs0k2XWfyTJUVMeXkoYU0w-6xYk',
    VRKALA: '1GNDWwI07ZtBkp3LE0VnBK8WrQ2urXvxOPMs7rsyM7xA',
    ELEARNING: '1-t7kNTIZGLqCo46_cO_lEPYkxtnFkX5vruydcdTUwgk',
    ANIMAL_SURGERY: '1QmbuU_yrc46-Se-ktK4WsiBCbXxX2IIlNKlAPCI45Oo',
    UDYOG: '1mBDPn4waXva1PnCyi02G_r4KaH7PfEt3hzgcwm4mKeo',
    REAL_ESTATE: '1JXWlD0zt83kdsssZrDHEvg_k_UOpQGwaa32kOid4ro4',
    HOSPITALITY: '1kHlEgbLAEh7kVUnMBYm_kyU0fxmGgw5IB4GCQly31fE',
    EXHIBITION: '1IyBgn_FFiQgTiqOaJbnEvhMw5m0WXEY1WnQUuxqIyVg',
    CRIME_SCENE: '127yRrYPlHJ1HGzESIT7ie_1ADlS9dAgFWFMoC-prezc',
    AIRCRAFT: '1XRqJeZ9-eOCx0RQiueRCS3z9pOz4Taxkg_auoo6t3bA',
    HERITAGE: '1U_-qoY3-s_dOwNLt-x5ZYKazmqp4wnaTMipoSS-dMoc',
    CITY_GUIDE: '1FUJpMHjYe1ILqkDA2XwS3eND9EwEFIN36O1m2DVVVR8',
    LIVESTREAM: '1vNDtCzj9PvZjX5v0zNOMQH-nN8OlLqntIZx0uQIW8BU',
    OTHERS: '1WkE7uwImh_Uv04JCX5US3ORPKNXIxuU6uINirRD4cuc',
    CAREERS: '1tET4e4E9s00o0CuBoTrjJv4wy6Wd8PYBiwTkWrXGREU',
    HOME: '1Hcd0d8LP8ECRDeyelrzgbX2fA26zwZcv2B_iyThwWWY',
    NINE_D_CHAIR: '1urTa4_5_G0n707dLp2UWdiAzPz2DS9sCUcF-j4He-Nw'
};

const fetchDocText = async (docId) => {
    const url = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch doc ${docId}`);
    return await response.text();
};

const updateDb = async (key, data) => {
    if (!data || Object.keys(data).length === 0) return;
    try {
        await pool.query(
            'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [key, JSON.stringify(data), JSON.stringify(data)]
        );
        console.log(`[AutoSync] Updated ${key} successfully.`);
    } catch (err) {
        console.error(`[AutoSync] DB Error for ${key}:`, err.message);
    }
};

const parsers = {
    tourism: (lines) => {
        const data = { hero: {}, experience: { features: [] }, stakeholders: { items: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- EXPERIENCE ---')) currentSection = 'experience';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':');
                const k = key.trim().toLowerCase();
                const v = valParts.join(':').trim();
                if (currentSection === 'hero') {
                    if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v;
                } else if (currentSection === 'experience') {
                    if (k === 'title') data.experience.title = v; if (k === 'subtitle') data.experience.subtitle = v;
                    if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.experience.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'stakeholders') {
                    if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v;
                    if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'why') {
                    if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v;
                    if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); }
                }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    drone: (lines) => {
        const data = { hero: {}, deck: { features: [] }, pillars: { items: [] }, stakeholders: { items: [] }, levels: { tiers: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- DECK ---')) currentSection = 'deck';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- LEVELS ---')) currentSection = 'levels';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') {
                    if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v;
                } else if (currentSection === 'deck') {
                    if (k === 'title') data.deck.title = v; if (k === 'subtitle') data.deck.subtitle = v;
                    if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.deck.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'pillars') {
                    if (k === 'title') data.pillars.title = v; if (k === 'subtitle') data.pillars.subtitle = v;
                    if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.pillars.items.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'stakeholders') {
                    if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v;
                    if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'levels') {
                    if (k === 'title') data.levels.title = v; if (k === 'subtitle') data.levels.subtitle = v;
                    if (k.startsWith('tier')) { const parts = v.split('|'); if (parts.length >= 2) data.levels.tiers.push({ level: parts[0].trim(), features: parts.slice(1).join('|').split(',').map(f => f.trim()) }); }
                } else if (currentSection === 'why') {
                    if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v;
                    if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); }
                }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    defence: (lines) => {
        const data = { hero: {}, suite: { features: [] }, pillars: { items: [] }, stakeholders: { items: [] }, scorecard: { items: [] }, security: { features: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- SUITE ---')) currentSection = 'suite';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- SCORECARD ---')) currentSection = 'scorecard';
            else if (line.includes('--- SECURITY ---')) currentSection = 'security';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') {
                    if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v;
                } else if (currentSection === 'suite') {
                    if (k === 'title') data.suite.title = v; if (k === 'subtitle') data.suite.subtitle = v;
                    if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.suite.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'pillars') {
                    if (k === 'title') data.pillars.title = v; if (k === 'subtitle') data.pillars.subtitle = v;
                    if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.pillars.items.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'stakeholders') {
                    if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v;
                    if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'scorecard') {
                    if (k === 'title') data.scorecard.title = v; if (k === 'subtitle') data.scorecard.subtitle = v;
                    if (k.startsWith('metric')) { const parts = v.split('|'); if (parts.length >= 2) data.scorecard.items.push({ metric: parts[0].trim(), value: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'security') {
                    if (k === 'title') data.security.title = v; if (k === 'subtitle') data.security.subtitle = v;
                    if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.security.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'why') {
                    if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v;
                    if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); }
                }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    industrial: (lines) => {
        const data = { hero: {}, industrialSuite: { features: [] }, applications: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- SUITE ---')) currentSection = 'suite';
            else if (line.includes('--- APPLICATIONS ---')) currentSection = 'apps';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') {
                    if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v;
                } else if (currentSection === 'suite') {
                    if (k === 'title') data.industrialSuite.title = v; if (k === 'subtitle') data.industrialSuite.subtitle = v;
                    if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.industrialSuite.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'apps') {
                    if (k === 'title') data.applications.title = v;
                    if (k.startsWith('app')) { const parts = v.split('|'); if (parts.length >= 2) data.applications.features.push({ focus: parts[0].trim(), audience: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); }
                } else if (currentSection === 'stats') {
                    if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v;
                    if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); }
                }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    vrlab: (lines) => {
        const data = { hero: {}, theLab: { features: [] }, benefits: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- LAB ---')) currentSection = 'lab';
            else if (line.includes('--- BENEFITS ---')) currentSection = 'benefits';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'lab') { if (k === 'title') data.theLab.title = v; if (k === 'subtitle') data.theLab.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.theLab.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'benefits') { if (k === 'title') data.benefits.title = v; if (k.startsWith('benefit')) { const parts = v.split('|'); if (parts.length >= 2) data.benefits.features.push({ focus: parts[0].trim(), audience: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stats') { if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    vrkala: (lines) => {
        const data = { hero: {}, immersionTrio: { features: [] }, impactPillars: { pillars: [] }, benefits: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TRIO ---')) currentSection = 'trio';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- BENEFITS ---')) currentSection = 'benefits';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'trio') { if (k === 'title') data.immersionTrio.title = v; if (k === 'subtitle') data.immersionTrio.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.immersionTrio.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'pillars') { if (k === 'title') data.impactPillars.title = v; if (k === 'subtitle') data.impactPillars.subtitle = v; if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.impactPillars.pillars.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'benefits') { if (k === 'title') data.benefits.title = v; if (k === 'subtitle') data.benefits.subtitle = v; if (k.startsWith('benefit')) { const parts = v.split('|'); if (parts.length >= 2) data.benefits.features.push({ focus: parts[0].trim(), audience: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stats') { if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    elearning: (lines) => {
        const data = { hero: {}, learningExperience: { features: [] }, benefits: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- EXPERIENCE ---')) currentSection = 'experience';
            else if (line.includes('--- BENEFITS ---')) currentSection = 'benefits';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'experience') { if (k === 'title') data.learningExperience.title = v; if (k === 'subtitle') data.learningExperience.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.learningExperience.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'benefits') { if (k === 'title') data.benefits.title = v; if (k === 'subtitle') data.benefits.subtitle = v; if (k.startsWith('benefit')) { const parts = v.split('|'); if (parts.length >= 2) data.benefits.features.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stats') { if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    animalSurgery: (lines) => {
        const data = { hero: {}, surgicalSuite: { features: [] }, benefits: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- SUITE ---')) currentSection = 'suite';
            else if (line.includes('--- BENEFITS ---')) currentSection = 'benefits';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'suite') { if (k === 'title') data.surgicalSuite.title = v; if (k === 'subtitle') data.surgicalSuite.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.surgicalSuite.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'benefits') { if (k === 'title') data.benefits.title = v; if (k.startsWith('benefit')) { const parts = v.split('|'); if (parts.length >= 2) data.benefits.features.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stats') { if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    udyog: (lines) => {
        const data = { hero: {}, industrialToolkit: { features: [] }, benefits: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TOOLKIT ---')) currentSection = 'toolkit';
            else if (line.includes('--- BENEFITS ---')) currentSection = 'benefits';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'toolkit') { if (k === 'title') data.industrialToolkit.title = v; if (k === 'subtitle') data.industrialToolkit.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.industrialToolkit.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'benefits') { if (k === 'title') data.benefits.title = v; if (k === 'subtitle') data.benefits.subtitle = v; if (k.startsWith('benefit')) { const parts = v.split('|'); if (parts.length >= 2) data.benefits.features.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stats') { if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    realEstate: (lines) => {
        const data = { hero: {}, interactiveFeatures: { features: [] }, stakeholders: { items: [] }, salesGallery: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- INTERACTIVE ---')) currentSection = 'interactive';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- GALLERY ---')) currentSection = 'gallery';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'accent') data.hero.accent = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'interactive') { if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.interactiveFeatures.features.push({ title: parts[0].trim(), desc: parts.slice(1).join('|').trim() }); } }
                else if (currentSection === 'stakeholders') { if (k === 'title') data.stakeholders.title = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'gallery') { if (k === 'title') data.salesGallery.title = v; if (k === 'subtitle') data.salesGallery.subtitle = v; if (k === 'cta') data.salesGallery.cta = v; if (k.startsWith('stat') || k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.salesGallery.items.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    hospitality: (lines) => {
        const data = { hero: {}, hospitalitySuite: { features: [] }, benefits: { features: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- SUITE ---')) currentSection = 'suite';
            else if (line.includes('--- BENEFITS ---')) currentSection = 'benefits';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'suite') { if (k === 'title') data.hospitalitySuite.title = v; if (k === 'subtitle') data.hospitalitySuite.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.hospitalitySuite.features.push({ title: parts[0].trim(), desc: parts.slice(1).join('|').trim() }); } }
                else if (currentSection === 'benefits') { if (k === 'title') data.benefits.title = v; if (k === 'subtitle') data.benefits.subtitle = v; if (k.startsWith('benefit')) { const parts = v.split('|'); if (parts.length >= 2) data.benefits.features.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stats') { if (k === 'title') data.stats.title = v; if (k === 'subtitle') data.stats.subtitle = v; if (k === 'cta') data.stats.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    exhibition: (lines) => {
        const data = { hero: {}, toolkit: { features: [] }, impact: { pillars: [] }, eventTypes: { items: [] }, logistics: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TOOLKIT ---')) currentSection = 'toolkit';
            else if (line.includes('--- IMPACT ---')) currentSection = 'impact';
            else if (line.includes('--- EVENTS ---')) currentSection = 'events';
            else if (line.includes('--- LOGISTICS ---')) currentSection = 'logistics';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'accent') data.hero.accent = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'toolkit') { if (k === 'title') data.toolkit.title = v; if (k === 'subtitle') data.toolkit.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.toolkit.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'impact') { if (k === 'title') data.impact.title = v; if (k === 'subtitle') data.impact.subtitle = v; if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.impact.pillars.push({ title: parts[0].trim(), desc: parts.slice(1).join('|').trim() }); } }
                else if (currentSection === 'events') { if (k === 'title') data.eventTypes.title = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.eventTypes.items.push({ title: parts[0].trim(), focus: parts[1].trim(), text: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'logistics') { if (k === 'title') data.logistics.title = v; if (k === 'subtitle') data.logistics.subtitle = v; if (k === 'cta') data.logistics.cta = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.logistics.items.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    crimeScene: (lines) => {
        const data = { hero: {}, toolkit: { features: [] }, pillars: { items: [] }, stakeholders: { items: [] }, metrics: { items: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TOOLKIT ---')) currentSection = 'toolkit';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- METRICS ---')) currentSection = 'metrics';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'toolkit') { if (k === 'title') data.toolkit.title = v; if (k === 'subtitle') data.toolkit.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.toolkit.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'pillars') { if (k === 'title') data.pillars.title = v; if (k === 'subtitle') data.pillars.subtitle = v; if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.pillars.items.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stakeholders') { if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'metrics') { if (k === 'title') data.metrics.title = v; if (k === 'subtitle') data.metrics.subtitle = v; if (k.startsWith('metric')) { const parts = v.split('|'); if (parts.length >= 2) data.metrics.items.push({ metric: parts[0].trim(), value: parts.slice(1).join('|').trim() }); } }
                else if (currentSection === 'why') { if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[0].trim(), value: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    aircraft: (lines) => {
        const data = { hero: {}, trio: { features: [] }, pillars: { items: [] }, stakeholders: { items: [] }, metrics: { items: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TRIO ---')) currentSection = 'trio';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- METRICS ---')) currentSection = 'metrics';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'trio') { if (k === 'title') data.trio.title = v; if (k === 'subtitle') data.trio.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.trio.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'pillars') { if (k === 'title') data.pillars.title = v; if (k === 'subtitle') data.pillars.subtitle = v; if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.pillars.items.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stakeholders') { if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'metrics') { if (k === 'title') data.metrics.title = v; if (k === 'subtitle') data.metrics.subtitle = v; if (k.startsWith('metric')) { const parts = v.split('|'); if (parts.length >= 2) data.metrics.items.push({ metric: parts[0].trim(), value: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'why') { if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    heritage: (lines) => {
        const data = { hero: {}, experience: { features: [] }, stakeholders: { items: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- EXPERIENCE ---')) currentSection = 'experience';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'experience') { if (k === 'title') data.experience.title = v; if (k === 'subtitle') data.experience.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.experience.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stakeholders') { if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'why') { if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    city: (lines) => {
        const data = { hero: {}, experience: { features: [] }, stakeholders: { items: [] }, whyMelzo: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- EXPERIENCE ---')) currentSection = 'experience';
            else if (line.includes('--- STAKEHOLDERS ---')) currentSection = 'stakeholders';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'experience') { if (k === 'title') data.experience.title = v; if (k === 'subtitle') data.experience.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.experience.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'stakeholders') { if (k === 'title') data.stakeholders.title = v; if (k === 'subtitle') data.stakeholders.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.stakeholders.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'why') { if (k === 'title') data.whyMelzo.title = v; if (k === 'subtitle') data.whyMelzo.subtitle = v; if (k === 'cta') data.whyMelzo.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.whyMelzo.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    livestream: (lines) => {
        const data = { hero: {}, trio: { features: [] }, pillars: { items: [] }, audience: { items: [] }, reach: { stats: [] }, engagement: { items: [] }, why: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TRIO ---')) currentSection = 'trio';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- AUDIENCE ---')) currentSection = 'audience';
            else if (line.includes('--- REACH ---')) currentSection = 'reach';
            else if (line.includes('--- ENGAGEMENT ---')) currentSection = 'engagement';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'trio') { if (k === 'title') data.trio.title = v; if (k === 'subtitle') data.trio.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.trio.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'pillars') { if (k === 'title') data.pillars.title = v; if (k === 'subtitle') data.pillars.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.pillars.items.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'audience') { if (k === 'title') data.audience.title = v; if (k === 'subtitle') data.audience.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.audience.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'reach') { if (k === 'title') data.reach.title = v; if (k === 'subtitle') data.reach.subtitle = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.reach.stats.push({ region: parts[0].trim(), connections: parts[1].trim() }); } }
                else if (currentSection === 'engagement') { if (k === 'title') data.engagement.title = v; if (k === 'subtitle') data.engagement.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 3) data.engagement.items.push({ metric: parts[0].trim(), vr: parts[1].trim(), video: parts[2].trim() }); } }
                else if (currentSection === 'why') { if (k === 'title') data.why.title = v; if (k === 'subtitle') data.why.subtitle = v; if (k === 'cta') data.why.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.why.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    others: (lines) => {
        const data = { hero: {}, trio: { features: [] }, pillars: { items: [] }, audience: { items: [] }, reach: { stats: [] }, engagement: { items: [] }, why: { stats: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- TRIO ---')) currentSection = 'trio';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- AUDIENCE ---')) currentSection = 'audience';
            else if (line.includes('--- REACH ---')) currentSection = 'reach';
            else if (line.includes('--- ENGAGEMENT ---')) currentSection = 'engagement';
            else if (line.includes('--- WHY ---')) currentSection = 'why';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'badge') data.hero.badge = v; if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v; }
                else if (currentSection === 'trio') { if (k === 'title') data.trio.title = v; if (k === 'subtitle') data.trio.subtitle = v; if (k.startsWith('feature')) { const parts = v.split('|'); if (parts.length >= 2) data.trio.features.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'pillars') { if (k === 'title') data.pillars.title = v; if (k === 'subtitle') data.pillars.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.pillars.items.push({ num: parts[0].trim(), title: parts[1].trim(), desc: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'audience') { if (k === 'title') data.audience.title = v; if (k === 'subtitle') data.audience.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 2) data.audience.items.push({ audience: parts[0].trim(), focus: parts[1].trim(), benefit: parts.slice(2).join('|').trim() }); } }
                else if (currentSection === 'reach') { if (k === 'title') data.reach.title = v; if (k === 'subtitle') data.reach.subtitle = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.reach.stats.push({ region: parts[0].trim(), connections: parts[1].trim() }); } }
                else if (currentSection === 'engagement') { if (k === 'title') data.engagement.title = v; if (k === 'subtitle') data.engagement.subtitle = v; if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 3) data.engagement.items.push({ metric: parts[0].trim(), vr: parts[1].trim(), video: parts[2].trim() }); } }
                else if (currentSection === 'why') { if (k === 'title') data.why.title = v; if (k === 'subtitle') data.why.subtitle = v; if (k === 'cta') data.why.cta = v; if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.why.stats.push({ label: parts[1].trim(), value: parts[0].trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    careers: (lines) => {
        const data = { hero: {}, values: { items: [] }, perks: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- VALUES ---')) currentSection = 'values';
            else if (line.includes('--- PERKS ---')) currentSection = 'perks';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') { if (k === 'title') data.hero.title = v; if (k === 'subtitle') data.hero.subtitle = v; if (k === 'button') data.hero.button = v; }
                else if (currentSection === 'values') { if (k === 'title') data.values.title = v; if (k === 'subtitle') data.values.subtitle = v; if (k.startsWith('value')) { const parts = v.split('|'); if (parts.length >= 2) data.values.items.push({ title: parts[0].trim(), desc: parts.slice(1).join('|').trim() }); } }
                else if (currentSection === 'perks') { if (k === 'title') data.perks.title = v; if (k.startsWith('perk')) { const parts = v.split('|'); if (parts.length >= 2) data.perks.items.push({ title: parts[0].trim(), desc: parts.slice(1).join('|').trim() }); } }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    home: (lines) => {
        const data = { hero: {}, whyVr: {} };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- WHY_VR ---')) currentSection = 'whyVr';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') {
                    if (k === 'titleline1') data.hero.titleLine1 = v; if (k === 'titlehighlight') data.hero.titleHighlight = v; if (k === 'description') data.hero.description = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v;
                } else if (currentSection === 'whyVr') {
                    if (k === 'titleline1') data.whyVr.titleLine1 = v; if (k === 'titlehighlight') data.whyVr.titleHighlight = v; if (k === 'description') data.whyVr.description = v;
                }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    },
    nineDChair: (lines) => {
        const data = { hero: {}, hardwareTrio: { items: [] }, corePillars: { items: [] }, audience: { items: [] }, stats: { items: [] } };
        let currentSection = '';
        for (const line of lines) {
            if (line.includes('--- HERO ---')) currentSection = 'hero';
            else if (line.includes('--- HARDWARE ---')) currentSection = 'hardware';
            else if (line.includes('--- PILLARS ---')) currentSection = 'pillars';
            else if (line.includes('--- AUDIENCE ---')) currentSection = 'audience';
            else if (line.includes('--- STATS ---')) currentSection = 'stats';
            else if (line.includes(':')) {
                const [key, ...valParts] = line.split(':'); const k = key.trim().toLowerCase(); const v = valParts.join(':').trim();
                if (currentSection === 'hero') {
                    if (k === 'badge') data.hero.badge = v; if (k === 'titleline1') data.hero.titleLine1 = v; if (k === 'titlehighlight') data.hero.titleHighlight = v; if (k === 'description') data.hero.description = v; if (k === 'primarybtn') data.hero.primaryBtn = v; if (k === 'secondarybtn') data.hero.secondaryBtn = v;
                } else if (currentSection === 'hardware') {
                    if (k === 'title') data.hardwareTrio.title = v;
                    if (k.startsWith('item')) { const parts = v.split('|'); if (parts.length >= 3) data.hardwareTrio.items.push({ number: parts[0].trim(), title: parts[1].trim(), desc: parts[2].trim() }); }
                } else if (currentSection === 'pillars') {
                    if (k === 'label') data.corePillars.label = v; if (k === 'title') data.corePillars.title = v;
                    if (k.startsWith('pillar')) { const parts = v.split('|'); if (parts.length >= 2) data.corePillars.items.push({ title: parts[0].trim(), desc: parts[1].trim() }); }
                } else if (currentSection === 'audience') {
                    if (k === 'title') data.audience.title = v;
                    if (k.startsWith('segment')) { const parts = v.split('|'); if (parts.length >= 2) data.audience.items.push({ title: parts[0].trim(), text: parts[1].trim() }); }
                } else if (currentSection === 'stats') {
                    if (k === 'title') data.stats.title = v; if (k === 'description') data.stats.description = v;
                    if (k.startsWith('stat')) { const parts = v.split('|'); if (parts.length >= 2) data.stats.items.push({ value: parts[0].trim(), label: parts[1].trim() }); }
                }
            }
        }
        return Object.keys(data.hero).length > 0 ? data : null;
    }
};

const LOCAL_DEFAULTS = {
    'vrTourism_live': 'vrTourismContent.json',
    'droneSimulator_live': 'droneSimulatorContent.json',
    'vrDefence_live': 'vrDefenceContent.json',
    'vrIndustrial_live': 'vrIndustrialContent.json',
    'vrLab_live': 'vrLabContent.json',
    'vrKala_live': 'vrKalaContent.json',
    'vrElearning_live': 'vrElearningContent.json',
    'vrAnimalSurgery_live': 'vrAnimalSurgeryContent.json',
    'vrUdyog_live': 'vrUdyogContent.json',
    'vrRealEstate_live': 'vrRealEstateContent.json',
    'vrHospitality_live': 'vrHospitalityContent.json',
    'vrExhibition_live': 'vrExhibitionContent.json',
    'vrCrimeScene_live': 'vrCrimeSceneContent.json',
    'aircraftSimulation_live': 'aircraftSimulationContent.json',
    'virtualHeritage_live': 'virtualHeritageContent.json',
    'cityGuide_live': 'cityGuideContent.json',
    'vrLiveStream_live': 'vrLiveStreamContent.json',
    'othersCustom_live': 'othersCustomContent.json',
    'careers_live': 'careersContent.json',
    'home_live': 'homeContent.json',
    'nineDChair_live': 'nineDChairContent.json'
};

const hydrateFromLocal = async () => {
    console.log('[AutoSync] Checking for missing local defaults...');
    const dataDir = path.join(__dirname, '../../website/src/data');

    for (const [key, filename] of Object.entries(LOCAL_DEFAULTS)) {
        try {
            // Check if key exists in DB (simplified check using INSERT IGNORE/UPDATE logic)
            // We only want to seed if the key is MISSING (to avoid overwriting sync data)
            const [rows] = await pool.query('SELECT 1 FROM site_settings WHERE setting_key = ?', [key]);
            if (rows.length === 0) {
                const filePath = path.join(dataDir, filename);
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    // ensure valid json
                    const json = JSON.parse(fileContent);
                    await updateDb(key, json);
                    console.log(`[AutoSync] Seeded ${key} from local ${filename}`);
                } else {
                    // console.warn(`[AutoSync] Local file not found: ${filename}`);
                }
            }
        } catch (err) {
            console.error(`[AutoSync] Seeding error for ${key}:`, err.message);
        }
    }
};

const syncAll = async () => {
    console.log('[AutoSync] Starting synchronization check...');

    const syncItem = async (docId, apiSlug, parser) => {
        if (!docId || docId.includes('YOUR_')) return;
        try {
            const text = await fetchDocText(docId);
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const data = parser(lines);
            await updateDb(apiSlug, data);
        } catch (e) {
            // console.error(`[AutoSync] Failed for ${apiSlug}:`, e.message);
        }
    };

    await syncItem(DOC_IDS.TOURISM, 'vrTourism_live', parsers.tourism);
    await syncItem(DOC_IDS.DRONE, 'droneSimulator_live', parsers.drone);
    await syncItem(DOC_IDS.DEFENCE, 'vrDefence_live', parsers.defence);
    await syncItem(DOC_IDS.INDUSTRIAL, 'vrIndustrial_live', parsers.industrial);

    await syncItem(DOC_IDS.VRLAB, 'vrLab_live', parsers.vrlab);
    await syncItem(DOC_IDS.VRKALA, 'vrKala_live', parsers.vrkala);
    await syncItem(DOC_IDS.ELEARNING, 'vrElearning_live', parsers.elearning);
    await syncItem(DOC_IDS.ANIMAL_SURGERY, 'vrAnimalSurgery_live', parsers.animalSurgery);
    await syncItem(DOC_IDS.UDYOG, 'vrUdyog_live', parsers.udyog);
    await syncItem(DOC_IDS.REAL_ESTATE, 'vrRealEstate_live', parsers.realEstate);
    await syncItem(DOC_IDS.HOSPITALITY, 'vrHospitality_live', parsers.hospitality);
    await syncItem(DOC_IDS.EXHIBITION, 'vrExhibition_live', parsers.exhibition);
    await syncItem(DOC_IDS.CRIME_SCENE, 'vrCrimeScene_live', parsers.crimeScene);
    await syncItem(DOC_IDS.AIRCRAFT, 'aircraftSimulation_live', parsers.aircraft);
    await syncItem(DOC_IDS.HERITAGE, 'virtualHeritage_live', parsers.heritage);
    await syncItem(DOC_IDS.CITY_GUIDE, 'cityGuide_live', parsers.city);
    await syncItem(DOC_IDS.LIVESTREAM, 'vrLiveStream_live', parsers.livestream);
    await syncItem(DOC_IDS.OTHERS, 'othersCustom_live', parsers.others);
    await syncItem(DOC_IDS.CAREERS, 'careers_live', parsers.careers);
    await syncItem(DOC_IDS.HOME, 'home_live', parsers.home);
    await syncItem(DOC_IDS.NINE_D_CHAIR, 'nineDChair_live', parsers.nineDChair);

    console.log('[AutoSync] Synchronization cycle complete.');
};

const startAutoSync = (intervalMinutes = 3) => {
    console.log(`[AutoSync] Service started. Syncing every ${intervalMinutes} minutes.`);

    // Populate from local JSON first if DB is empty, then run network sync
    hydrateFromLocal().then(() => {
        syncAll();
    });

    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(syncAll, intervalMs);
};

module.exports = { startAutoSync, syncAll };
