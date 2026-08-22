-- ====================================================================
-- LegalAI - Relational Database Schema & Initial Seed Data
-- Designed for: MySQL 8.0+ / PostgreSQL 14+
-- Prepared by: Sourabh (Data Engineer) for Database Team Member
-- ====================================================================

-- 1. DROP EXISTING TABLES (IF ANY)
DROP TABLE IF EXISTS case_timeline_milestones;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS lawyers;
DROP TABLE IF EXISTS statutory_acts;
DROP TABLE IF EXISTS precedents;
DROP TABLE IF EXISTS users;

-- --------------------------------------------------------------------
-- 2. USERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$12$demoHashedPasswordLegalAI',
    role ENUM('CITIZEN', 'LAWYER') NOT NULL DEFAULT 'CITIZEN',
    initials VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. LAWYERS TABLE
-- --------------------------------------------------------------------
CREATE TABLE lawyers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    court VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    experience_years VARCHAR(50) NOT NULL,
    languages VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    rating DECIMAL(2, 1) DEFAULT 4.8,
    bio TEXT,
    bar_enrolment_number VARCHAR(100) NOT NULL,
    state_bar_council VARCHAR(255) NOT NULL,
    verification_status ENUM('VERIFIED', 'PENDING', 'REJECTED') DEFAULT 'VERIFIED',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------------------
-- 4. CASES TABLE
-- --------------------------------------------------------------------
CREATE TABLE cases (
    id VARCHAR(64) PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(64),
    lawyer_id VARCHAR(64),
    court VARCHAR(255) NOT NULL,
    judge VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    statutory_acts VARCHAR(255),
    next_hearing_date VARCHAR(50),
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE SET NULL
);

-- --------------------------------------------------------------------
-- 5. PRECEDENTS (LANDMARK JUDGMENTS) TABLE
-- --------------------------------------------------------------------
CREATE TABLE precedents (
    id VARCHAR(64) PRIMARY KEY,
    case_name VARCHAR(255) NOT NULL,
    citation VARCHAR(100) NOT NULL,
    court VARCHAR(255) NOT NULL,
    bench VARCHAR(255),
    year INT NOT NULL,
    act_and_section VARCHAR(255) NOT NULL,
    legal_issue TEXT,
    ratio_decidendi TEXT NOT NULL,
    facts TEXT,
    verdict_outcome VARCHAR(100)
);

-- --------------------------------------------------------------------
-- 6. STATUTORY ACTS & SECTIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE statutory_acts (
    id VARCHAR(64) PRIMARY KEY,
    act_name VARCHAR(255) NOT NULL,
    section_number VARCHAR(50) NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    legal_domain VARCHAR(100) NOT NULL,
    statutory_text TEXT NOT NULL,
    plain_explanation TEXT NOT NULL,
    relevant_disputes TEXT
);

-- --------------------------------------------------------------------
-- 7. DOCUMENTS & OCR TABLE
-- --------------------------------------------------------------------
CREATE TABLE documents (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    case_id VARCHAR(64),
    file_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) DEFAULT 'Agreement',
    extracted_text LONGTEXT,
    summary TEXT,
    risk_level ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'LOW',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
);

-- ====================================================================
-- SEED DATA (INITIAL MOCK RECORDS)
-- ====================================================================

-- Seed Users
INSERT INTO users (id, name, email, role, initials) VALUES
('usr-demo-citizen', 'Anil Kumar', 'anil@example.com', 'CITIZEN', 'AK'),
('usr-demo-lawyer', 'Adv. Rajesh Sharma', 'rajesh@lawchambers.in', 'LAWYER', 'RS'),
('usr-demo-lawyer2', 'Adv. Priya Deshmukh', 'priya@deshmukhlegal.in', 'LAWYER', 'PD');

-- Seed Lawyers
INSERT INTO lawyers (id, user_id, name, court, location, experience_years, languages, specialization, rating, bio, bar_enrolment_number, state_bar_council, verification_status) VALUES
('law-1', 'usr-demo-lawyer', 'Adv. Rajesh Sharma', 'High Court of Delhi & Supreme Court', 'New Delhi', '14 Years', 'English, Hindi', 'Property, Civil & Constitutional Law', 4.9, 'Senior counsel specializing in landlord-tenant disputes, land acquisition, and writ petitions before High Court of Delhi.', 'MAH/1234/2015', 'Bar Council of Maharashtra & Goa', 'VERIFIED'),
('law-2', 'usr-demo-lawyer2', 'Adv. Priya Deshmukh', 'Bombay High Court', 'Mumbai', '11 Years', 'English, Marathi, Hindi', 'Corporate Contracts, Arbitration & Consumer Disputes', 4.8, 'Arbitrator and counsel with extensive trial experience in commercial arbitration and breach of contract disputes.', 'MAH/5678/2018', 'Bar Council of Maharashtra & Goa', 'VERIFIED');

-- Seed Cases
INSERT INTO cases (id, case_number, title, description, user_id, lawyer_id, court, judge, status, statutory_acts, next_hearing_date, progress_percentage) VALUES
('case-101', '2023-CC-1234', 'Property Dispute - Ancestral Land Title', 'Dispute regarding the ownership and inheritance rights of ancestral property in Mumbai', 'usr-demo-citizen', 'law-1', 'Delhi High Court', 'Justice M. K. Sharma', 'Active', 'Transfer of Property Act Section 44', '28 August 2026', 65),
('case-102', '2024-CC-5678', 'Tenant Rights - Unlawful Deposit Forfeiture', 'Landlord refusing to refund Rs. 75,000 security deposit after 30-day notice', 'usr-demo-citizen', 'law-1', 'High Court of Delhi', 'Justice P. S. Naidu', 'Pending Response', 'Transfer of Property Act Section 108(m)', '10 September 2026', 40);

-- Seed Precedents
INSERT INTO precedents (id, case_name, citation, court, bench, year, act_and_section, legal_issue, ratio_decidendi, verdict_outcome) VALUES
('SC-PREC-001', 'TRF Limited vs. Energo Engineering Projects Ltd.', '(2017) 8 SCC 377', 'Supreme Court of India', '3-Judge Bench', 2017, 'Arbitration and Conciliation Act Section 12(5)', 'Ineligibility of arbitrator to nominate another arbitrator', 'By operation of law, once an arbitrator becomes ineligible under Section 12(5), he cannot nominate another arbitrator.', 'Allowed in favor of Appellant'),
('SC-PREC-002', 'Perkins Eastman Architects DPC vs. HSCC (India) Ltd.', '(2020) 20 SCC 760', 'Supreme Court of India', '2-Judge Bench', 2019, 'Arbitration and Conciliation Act Section 11(6)', 'Validity of unilateral appointment of sole arbitrator', 'A person who has an interest in the dispute outcome cannot appoint a sole arbitrator, ensuring independence and impartiality.', 'Allowed in favor of Petitioner'),
('SC-PREC-003', 'K.P. Moolchand vs. State of Delhi & Anr.', '(2018) SCC Online Del 942', 'High Court of Delhi', 'Single Bench', 2018, 'Transfer of Property Act Section 108(m)', 'Arbitrary forfeiture of tenant security deposit', 'Landlord cannot arbitrarily forfeit security deposit without proof of actual damage beyond normal wear and tear.', 'Allowed in favor of Tenant'),
('SC-PREC-004', 'G.P. Srivastava vs. R.K. Raizada & Ors.', '(2000) 3 SCC 54', 'Supreme Court of India', '2-Judge Bench', 2000, 'Code of Civil Procedure Order 9 Rule 13', 'Setting aside ex-parte decree', 'Sufficient cause under Order 9 Rule 13 CPC must be construed liberally to advance the cause of justice.', 'Allowed in favor of Appellant');

-- Seed Statutory Acts
INSERT INTO statutory_acts (id, act_name, section_number, section_title, legal_domain, statutory_text, plain_explanation, relevant_disputes) VALUES
('ACT-TPA-108M', 'Transfer of Property Act, 1882', 'Section 108(m)', 'Duty of Lessee to Restore Property', 'Property & Tenancy Law', 'The lessee is bound to keep and restore the property in as good condition, subject to reasonable wear and tear.', 'A tenant is not liable for normal wear and tear. Landlords cannot withhold security deposit arbitrarily.', 'Security deposit refund, rental disputes'),
('ACT-ICA-73', 'Indian Contract Act, 1872', 'Section 73', 'Compensation for Loss Caused by Breach', 'Contract Law', 'The party who suffers by breach is entitled to receive compensation for any loss naturally arising.', 'Any party suffering financial loss due to breach of agreement terms can claim compensatory damages.', 'Contract breach, default in refund'),
('ACT-ICA-27', 'Indian Contract Act, 1872', 'Section 27', 'Agreement in Restraint of Trade Void', 'Employment Law', 'Every agreement by which any one is restrained from exercising a lawful trade or business is void.', 'Post-employment non-compete clauses restricting an employee from joining a competitor are generally void.', 'Employment non-compete clauses'),
('ACT-CPC-O9R13', 'Code of Civil Procedure, 1908', 'Order 9 Rule 13', 'Setting Aside Ex-Parte Decree', 'Civil Procedure', 'In any case in which a decree is passed ex parte, court shall make an order setting it aside upon proof of sufficient cause.', 'If an ex-parte decree was passed against you due to lack of summons or illness, you can apply to set it aside.', 'Ex-parte decree, missed court hearing');
