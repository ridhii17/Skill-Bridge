import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import Skill from '../models/Skill.js';
import CareerRole from '../models/CareerRole.js';
import Assessment from '../models/Assessment.js';
import Job from '../models/Job.js';
import LearningResource from '../models/LearningResource.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge';

// ═══════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════
const skillsData = [
  { name: 'JavaScript', category: 'frontend', description: 'Core programming language for web development', weight: 2.0 },
  { name: 'React', category: 'frontend', description: 'Modern UI library for building component-based interfaces', weight: 1.8 },
  { name: 'HTML', category: 'frontend', description: 'Markup language for web pages', weight: 1.0 },
  { name: 'CSS', category: 'frontend', description: 'Styling language for web pages', weight: 1.0 },
  { name: 'TypeScript', category: 'frontend', description: 'Typed superset of JavaScript', weight: 1.5 },
  { name: 'Node.js', category: 'backend', description: 'Server-side JavaScript runtime', weight: 1.8 },
  { name: 'Express.js', category: 'backend', description: 'Web framework for Node.js', weight: 1.5 },
  { name: 'REST APIs', category: 'backend', description: 'Architectural style for API design', weight: 1.5 },
  { name: 'GraphQL', category: 'backend', description: 'Query language for APIs', weight: 1.0 },
  { name: 'MongoDB', category: 'database', description: 'NoSQL document database', weight: 1.5 },
  { name: 'SQL', category: 'database', description: 'Relational database query language', weight: 1.3 },
  { name: 'PostgreSQL', category: 'database', description: 'Advanced relational database', weight: 1.2 },
  { name: 'Redis', category: 'database', description: 'In-memory data store', weight: 0.8 },
  { name: 'Git', category: 'general', description: 'Version control system', weight: 1.5 },
  { name: 'Data Structures', category: 'general', description: 'Fundamental data organization concepts', weight: 1.8 },
  { name: 'Algorithms', category: 'general', description: 'Problem-solving procedures', weight: 1.8 },
  { name: 'System Design', category: 'general', description: 'Architecture and scalability design', weight: 1.5 },
  { name: 'Docker', category: 'devops', description: 'Containerization platform', weight: 1.2 },
  { name: 'AWS', category: 'devops', description: 'Cloud computing platform', weight: 1.3 },
  { name: 'CI/CD', category: 'devops', description: 'Continuous integration and deployment', weight: 1.0 },
  { name: 'Linux', category: 'devops', description: 'Operating system for servers', weight: 1.0 },
  { name: 'Python', category: 'backend', description: 'Versatile programming language', weight: 1.5 },
  { name: 'Machine Learning', category: 'ai_ml', description: 'AI/ML model development', weight: 1.5 },
  { name: 'Data Analysis', category: 'data', description: 'Data processing and insights', weight: 1.3 },
  { name: 'SQL Queries', category: 'data', description: 'Complex SQL querying', weight: 1.2 },
  { name: 'Data Visualization', category: 'data', description: 'Charts and visual data representation', weight: 1.0 },
  { name: 'Cybersecurity', category: 'security', description: 'Information security practices', weight: 1.5 },
  { name: 'Network Security', category: 'security', description: 'Network protection and monitoring', weight: 1.3 },
  { name: 'Communication', category: 'soft_skill', description: 'Professional communication skills', weight: 1.2 },
  { name: 'Problem Solving', category: 'soft_skill', description: 'Analytical thinking and solution design', weight: 1.5 },
];

// ═══════════════════════════════════════════════════════════
// CAREER ROLES
// ═══════════════════════════════════════════════════════════
const careerRolesData = [
  {
    title: 'Full Stack Developer',
    description: 'Build complete web applications from frontend to backend. Work with JavaScript ecosystems, databases, and deployment.',
    icon: 'Layers',
    averageSalary: '₹6–18 LPA',
    requiredSkills: [
      { skillName: 'JavaScript', minimumScore: 75, importanceWeight: 2.0 },
      { skillName: 'React', minimumScore: 70, importanceWeight: 1.8 },
      { skillName: 'Node.js', minimumScore: 70, importanceWeight: 1.8 },
      { skillName: 'Express.js', minimumScore: 65, importanceWeight: 1.5 },
      { skillName: 'MongoDB', minimumScore: 65, importanceWeight: 1.5 },
      { skillName: 'REST APIs', minimumScore: 70, importanceWeight: 1.5 },
      { skillName: 'Git', minimumScore: 60, importanceWeight: 1.5 },
      { skillName: 'Data Structures', minimumScore: 55, importanceWeight: 1.8 },
      { skillName: 'System Design', minimumScore: 50, importanceWeight: 1.5 },
    ],
  },
  {
    title: 'Frontend Developer',
    description: 'Create beautiful, responsive user interfaces. Master HTML, CSS, JavaScript and modern frameworks like React.',
    icon: 'Monitor',
    averageSalary: '₹5–15 LPA',
    requiredSkills: [
      { skillName: 'JavaScript', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'React', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'HTML', minimumScore: 85, importanceWeight: 1.5 },
      { skillName: 'CSS', minimumScore: 80, importanceWeight: 1.5 },
      { skillName: 'TypeScript', minimumScore: 60, importanceWeight: 1.2 },
      { skillName: 'REST APIs', minimumScore: 60, importanceWeight: 1.0 },
      { skillName: 'Git', minimumScore: 60, importanceWeight: 1.2 },
    ],
  },
  {
    title: 'Backend Developer',
    description: 'Design and build server-side logic, APIs, and database architectures. Focus on performance, security, and scalability.',
    icon: 'Server',
    averageSalary: '₹6–18 LPA',
    requiredSkills: [
      { skillName: 'Node.js', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'Express.js', minimumScore: 75, importanceWeight: 1.8 },
      { skillName: 'MongoDB', minimumScore: 75, importanceWeight: 1.8 },
      { skillName: 'SQL', minimumScore: 65, importanceWeight: 1.5 },
      { skillName: 'REST APIs', minimumScore: 80, importanceWeight: 1.8 },
      { skillName: 'JavaScript', minimumScore: 70, importanceWeight: 1.5 },
      { skillName: 'System Design', minimumScore: 60, importanceWeight: 1.5 },
      { skillName: 'Docker', minimumScore: 50, importanceWeight: 1.2 },
    ],
  },
  {
    title: 'Data Analyst',
    description: 'Analyze datasets to find actionable insights. Work with SQL, Python, data visualization, and statistical methods.',
    icon: 'BarChart3',
    averageSalary: '₹4–12 LPA',
    requiredSkills: [
      { skillName: 'SQL', minimumScore: 85, importanceWeight: 2.0 },
      { skillName: 'SQL Queries', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'Python', minimumScore: 70, importanceWeight: 1.8 },
      { skillName: 'Data Analysis', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'Data Visualization', minimumScore: 70, importanceWeight: 1.5 },
      { skillName: 'Problem Solving', minimumScore: 65, importanceWeight: 1.5 },
    ],
  },
  {
    title: 'AI/ML Engineer',
    description: 'Build machine learning models and AI systems. Work with Python, ML frameworks, data pipelines, and model deployment.',
    icon: 'Brain',
    averageSalary: '₹8–25 LPA',
    requiredSkills: [
      { skillName: 'Python', minimumScore: 85, importanceWeight: 2.0 },
      { skillName: 'Machine Learning', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'Data Analysis', minimumScore: 75, importanceWeight: 1.5 },
      { skillName: 'SQL', minimumScore: 60, importanceWeight: 1.2 },
      { skillName: 'Data Structures', minimumScore: 65, importanceWeight: 1.5 },
      { skillName: 'Algorithms', minimumScore: 65, importanceWeight: 1.5 },
      { skillName: 'Problem Solving', minimumScore: 70, importanceWeight: 1.5 },
    ],
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Protect systems and networks from cyber threats. Work with security tools, monitoring, incident response, and compliance.',
    icon: 'Shield',
    averageSalary: '₹5–15 LPA',
    requiredSkills: [
      { skillName: 'Cybersecurity', minimumScore: 80, importanceWeight: 2.0 },
      { skillName: 'Network Security', minimumScore: 75, importanceWeight: 2.0 },
      { skillName: 'Linux', minimumScore: 70, importanceWeight: 1.8 },
      { skillName: 'Problem Solving', minimumScore: 65, importanceWeight: 1.5 },
      { skillName: 'Communication', minimumScore: 60, importanceWeight: 1.2 },
      { skillName: 'Python', minimumScore: 55, importanceWeight: 1.3 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// ASSESSMENT QUESTIONS
// ═══════════════════════════════════════════════════════════
const assessmentQuestionsData = {
  'Full Stack Developer': {
    title: 'Full Stack Developer Competency Assessment',
    description: 'Test your skills across the full JavaScript stack — frontend, backend, databases, and engineering fundamentals.',
    timeLimitMinutes: 30,
    passingScore: 60,
    questions: [
      // JavaScript
      {
        questionText: 'What will `typeof null` return in JavaScript?',
        options: ['"null"', '"object"', '"undefined"', '"boolean"'],
        correctAnswer: 1, skillName: 'JavaScript', difficulty: 'beginner',
        explanation: 'typeof null returns "object" — this is a well-known JavaScript quirk dating back to the first implementation.',
      },
      {
        questionText: 'Which method creates a new array with elements that pass a test?',
        options: ['map()', 'filter()', 'reduce()', 'forEach()'],
        correctAnswer: 1, skillName: 'JavaScript', difficulty: 'beginner',
        explanation: 'filter() creates a new array with all elements that pass the test implemented by the provided function.',
      },
      {
        questionText: 'What does the `===` operator check in JavaScript?',
        options: ['Value only', 'Value and type', 'Reference only', 'Value or type'],
        correctAnswer: 1, skillName: 'JavaScript', difficulty: 'beginner',
        explanation: 'The strict equality operator (===) checks both value and type without type coercion.',
      },
      // React
      {
        questionText: 'What hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1, skillName: 'React', difficulty: 'beginner',
        explanation: 'useEffect is used to perform side effects like data fetching, subscriptions, or manually changing the DOM.',
      },
      {
        questionText: 'In React, what is the purpose of keys in a list?',
        options: ['Styling', 'Helping React identify which items changed', 'Adding security', 'Setting default values'],
        correctAnswer: 1, skillName: 'React', difficulty: 'intermediate',
        explanation: 'Keys help React identify which items have changed, been added, or removed, enabling efficient re-rendering.',
      },
      {
        questionText: 'Which method is used to update state in a React component?',
        options: ['this.state = ...', 'setState()', 'updateState()', 'modifyState()'],
        correctAnswer: 1, skillName: 'React', difficulty: 'beginner',
        explanation: 'setState() (or the setter from useState) is the correct way to update state, triggering a re-render.',
      },
      // Node.js
      {
        questionText: 'What is the event loop in Node.js?',
        options: ['A for loop', 'A mechanism that handles async operations', 'A database query', 'A file system watcher'],
        correctAnswer: 1, skillName: 'Node.js', difficulty: 'intermediate',
        explanation: 'The event loop is what allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.',
      },
      {
        questionText: 'Which module is used to create a web server in Node.js?',
        options: ['fs', 'http', 'path', 'url'],
        correctAnswer: 1, skillName: 'Node.js', difficulty: 'beginner',
        explanation: 'The http module provides HTTP server and client functionality for creating web servers.',
      },
      // Express.js
      {
        questionText: 'In Express.js, what does `app.use()` do?',
        options: ['Creates a route', 'Mounts middleware', 'Sends a response', 'Defines a view engine'],
        correctAnswer: 1, skillName: 'Express.js', difficulty: 'beginner',
        explanation: 'app.use() mounts middleware functions that execute during the request-response cycle.',
      },
      {
        questionText: 'How do you define a route parameter in Express.js?',
        options: ['/:id', '?id=', '#id', '@id'],
        correctAnswer: 0, skillName: 'Express.js', difficulty: 'beginner',
        explanation: 'Route parameters are defined with a colon prefix like /:id, and accessed via req.params.id.',
      },
      // MongoDB
      {
        questionText: 'What type of database is MongoDB?',
        options: ['Relational', 'Document-based NoSQL', 'Graph', 'Key-value'],
        correctAnswer: 1, skillName: 'MongoDB', difficulty: 'beginner',
        explanation: 'MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like BSON documents.',
      },
      {
        questionText: 'Which MongoDB method finds a single document by ID?',
        options: ['find()', 'findOne()', 'findById()', 'get()'],
        correctAnswer: 2, skillName: 'MongoDB', difficulty: 'beginner',
        explanation: 'findById() is a Mongoose convenience method that finds a document by its _id field.',
      },
      // REST APIs
      {
        questionText: 'Which HTTP method is used to create a new resource?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 1, skillName: 'REST APIs', difficulty: 'beginner',
        explanation: 'POST is used to create a new resource on the server.',
      },
      {
        questionText: 'What does the 404 HTTP status code indicate?',
        options: ['Server error', 'Unauthorized', 'Not found', 'Bad request'],
        correctAnswer: 2, skillName: 'REST APIs', difficulty: 'beginner',
        explanation: '404 Not Found indicates the server cannot find the requested resource.',
      },
      // Git
      {
        questionText: 'What does `git clone` do?',
        options: ['Creates a new branch', 'Copies a repository to your local machine', 'Merges branches', 'Commits changes'],
        correctAnswer: 1, skillName: 'Git', difficulty: 'beginner',
        explanation: 'git clone creates a copy of a remote repository on your local machine.',
      },
      // Data Structures
      {
        questionText: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
        correctAnswer: 2, skillName: 'Data Structures', difficulty: 'intermediate',
        explanation: 'Binary search halves the search space each step, giving O(log n) time complexity.',
      },
      {
        questionText: 'Which data structure uses FIFO (First In, First Out)?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correctAnswer: 1, skillName: 'Data Structures', difficulty: 'beginner',
        explanation: 'A Queue follows FIFO — the first element added is the first one removed.',
      },
      // System Design
      {
        questionText: 'What is horizontal scaling?',
        options: ['Adding more CPU power', 'Adding more machines', 'Increasing RAM', 'Upgrading disk space'],
        correctAnswer: 1, skillName: 'System Design', difficulty: 'intermediate',
        explanation: 'Horizontal scaling (scaling out) means adding more machines to distribute the load.',
      },
      {
        questionText: 'What is a load balancer used for?',
        options: ['Encrypting data', 'Distributing traffic across servers', 'Storing files', 'Managing databases'],
        correctAnswer: 1, skillName: 'System Design', difficulty: 'intermediate',
        explanation: 'A load balancer distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed.',
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// JOBS
// ═══════════════════════════════════════════════════════════
const jobsData = [
  { title: 'Junior Full Stack Developer', company: 'TechStart Solutions', location: 'Bangalore', jobType: 'full_time', salary: { min: 400000, max: 800000 }, description: 'Join our team building modern web applications with React and Node.js. Great opportunity for fresh graduates.', requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'], experienceRequired: 0, educationRequired: 'B.Tech/BCA', careerRole: 'Full Stack Developer' },
  { title: 'Full Stack Developer', company: 'InnovateTech', location: 'Hyderabad', jobType: 'full_time', salary: { min: 800000, max: 1500000 }, description: 'Build scalable microservices and responsive frontends. Work with Express, React, and MongoDB.', requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'], experienceRequired: 2, educationRequired: 'B.Tech', careerRole: 'Full Stack Developer' },
  { title: 'Senior Full Stack Developer', company: 'CloudNine Labs', location: 'Pune', jobType: 'full_time', salary: { min: 1500000, max: 2500000 }, description: 'Lead development of enterprise SaaS platform. Mentor juniors and architect solutions.', requiredSkills: ['JavaScript', 'React', 'Node.js', 'System Design', 'Docker', 'MongoDB'], experienceRequired: 5, educationRequired: 'B.Tech/MCA', careerRole: 'Full Stack Developer' },
  { title: 'Frontend Developer Intern', company: 'DesignFirst', location: 'Remote', jobType: 'internship', salary: { min: 150000, max: 300000 }, description: 'Learn modern React development in a fast-paced startup environment.', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'], experienceRequired: 0, educationRequired: 'Student/Graduate', careerRole: 'Frontend Developer' },
  { title: 'Frontend Developer', company: 'UICraft Studio', location: 'Mumbai', jobType: 'full_time', salary: { min: 600000, max: 1200000 }, description: 'Create pixel-perfect responsive interfaces. Work with React, TypeScript, and Tailwind.', requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'], experienceRequired: 1, educationRequired: 'B.Tech/BCA', careerRole: 'Frontend Developer' },
  { title: 'Senior Frontend Engineer', company: 'PixelPerfect Inc', location: 'Bangalore', jobType: 'full_time', salary: { min: 1200000, max: 2200000 }, description: 'Lead frontend architecture for our consumer products. Performance and accessibility focus.', requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'System Design'], experienceRequired: 4, educationRequired: 'B.Tech', careerRole: 'Frontend Developer' },
  { title: 'Backend Developer', company: 'APIWorks', location: 'Chennai', jobType: 'full_time', salary: { min: 600000, max: 1200000 }, description: 'Design and build RESTful APIs and microservices. Node.js, Express, and MongoDB stack.', requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'], experienceRequired: 1, educationRequired: 'B.Tech', careerRole: 'Backend Developer' },
  { title: 'Senior Backend Engineer', company: 'ScaleUp Systems', location: 'Bangalore', jobType: 'full_time', salary: { min: 1400000, max: 2400000 }, description: 'Architect high-performance backend systems handling millions of requests daily.', requiredSkills: ['Node.js', 'MongoDB', 'System Design', 'Docker', 'REST APIs', 'SQL'], experienceRequired: 5, educationRequired: 'B.Tech/M.Tech', careerRole: 'Backend Developer' },
  { title: 'Backend Developer (Contract)', company: 'DevHire', location: 'Remote', jobType: 'contract', salary: { min: 50000, max: 100000 }, description: '6-month contract for API development. Flexible hours, fully remote.', requiredSkills: ['Node.js', 'Express.js', 'REST APIs', 'MongoDB'], experienceRequired: 2, educationRequired: 'Any', careerRole: 'Backend Developer' },
  { title: 'Junior Data Analyst', company: 'DataPulse Analytics', location: 'Noida', jobType: 'full_time', salary: { min: 400000, max: 800000 }, description: 'Analyze business data and create dashboards. SQL, Python, and visualization skills needed.', requiredSkills: ['SQL', 'Python', 'Data Analysis', 'Data Visualization'], experienceRequired: 0, educationRequired: 'B.Tech/BCA/B.Sc', careerRole: 'Data Analyst' },
  { title: 'Data Analyst', company: 'InsightCo', location: 'Gurgaon', jobType: 'full_time', salary: { min: 700000, max: 1200000 }, description: 'Drive data-informed decisions across product and marketing. Advanced SQL and Python required.', requiredSkills: ['SQL', 'Python', 'Data Analysis', 'Data Visualization', 'SQL Queries'], experienceRequired: 2, educationRequired: 'B.Tech/MCA', careerRole: 'Data Analyst' },
  { title: 'ML Engineer Intern', company: 'NeuralEdge AI', location: 'Bangalore', jobType: 'internship', salary: { min: 200000, max: 400000 }, description: 'Work on real ML projects. Build and train models with Python and popular ML frameworks.', requiredSkills: ['Python', 'Machine Learning', 'Data Analysis'], experienceRequired: 0, educationRequired: 'Student/Graduate', careerRole: 'AI/ML Engineer' },
  { title: 'AI/ML Engineer', company: 'DeepLearn Tech', location: 'Bangalore', jobType: 'full_time', salary: { min: 1000000, max: 2000000 }, description: 'Design and deploy ML models at scale. Work with cutting-edge NLP and computer vision.', requiredSkills: ['Python', 'Machine Learning', 'Data Analysis', 'Problem Solving'], experienceRequired: 2, educationRequired: 'B.Tech/M.Tech', careerRole: 'AI/ML Engineer' },
  { title: 'Cybersecurity Analyst', company: 'SecureNet Solutions', location: 'Hyderabad', jobType: 'full_time', salary: { min: 500000, max: 1000000 }, description: 'Monitor, detect, and respond to security incidents. Work with SIEM tools and threat intelligence.', requiredSkills: ['Cybersecurity', 'Network Security', 'Linux', 'Python'], experienceRequired: 1, educationRequired: 'B.Tech/BCA', careerRole: 'Cybersecurity Analyst' },
  { title: 'Security Engineer', company: 'CyberShield Corp', location: 'Pune', jobType: 'full_time', salary: { min: 800000, max: 1600000 }, description: 'Build security infrastructure and conduct penetration testing. CISSP/CEH preferred.', requiredSkills: ['Cybersecurity', 'Network Security', 'Linux', 'Problem Solving'], experienceRequired: 3, educationRequired: 'B.Tech', careerRole: 'Cybersecurity Analyst' },
];

// ═══════════════════════════════════════════════════════════
// LEARNING RESOURCES
// ═══════════════════════════════════════════════════════════
const learningResourcesData = [
  { title: 'JavaScript Fundamentals', skillName: 'JavaScript', level: 'beginner', type: 'course', duration: '8 hours', description: 'Master JavaScript basics: variables, functions, arrays, objects, and ES6+ features.', provider: 'freeCodeCamp', isFree: true },
  { title: 'Advanced JavaScript Patterns', skillName: 'JavaScript', level: 'advanced', type: 'course', duration: '12 hours', description: 'Deep dive into closures, prototypes, async patterns, and design patterns.', provider: 'Pluralsight', isFree: false },
  { title: 'React Official Tutorial', skillName: 'React', level: 'beginner', type: 'course', duration: '6 hours', description: 'Learn React from the official docs. Components, hooks, state management.', provider: 'React.dev', isFree: true },
  { title: 'React Performance Optimization', skillName: 'React', level: 'advanced', type: 'article', duration: '2 hours', description: 'Techniques for optimizing React performance: memo, useMemo, code splitting.', provider: 'Blog', isFree: true },
  { title: 'Node.js Crash Course', skillName: 'Node.js', level: 'beginner', type: 'video', duration: '10 hours', description: 'Complete Node.js tutorial covering modules, file system, HTTP, and Express.', provider: 'YouTube', isFree: true },
  { title: 'Building RESTful APIs with Express', skillName: 'Express.js', level: 'intermediate', type: 'course', duration: '8 hours', description: 'Build production-ready REST APIs with Express, middleware, and error handling.', provider: 'Udemy', isFree: false },
  { title: 'MongoDB University', skillName: 'MongoDB', level: 'beginner', type: 'course', duration: '15 hours', description: 'Official MongoDB courses covering CRUD, aggregation, indexing, and design patterns.', provider: 'MongoDB', isFree: true },
  { title: 'SQL Fundamentals', skillName: 'SQL', level: 'beginner', type: 'course', duration: '6 hours', description: 'Learn SQL from scratch: SELECT, JOIN, GROUP BY, subqueries, and more.', provider: 'Khan Academy', isFree: true },
  { title: 'Advanced SQL Querying', skillName: 'SQL Queries', level: 'intermediate', type: 'practice', duration: '10 hours', description: 'Practice complex SQL queries on real datasets. Window functions, CTEs, optimization.', provider: 'HackerRank', isFree: true },
  { title: 'Git & GitHub Mastery', skillName: 'Git', level: 'beginner', type: 'course', duration: '4 hours', description: 'Complete Git tutorial: branches, merges, rebasing, and GitHub workflows.', provider: 'YouTube', isFree: true },
  { title: 'Data Structures in JavaScript', skillName: 'Data Structures', level: 'intermediate', type: 'course', duration: '12 hours', description: 'Implement arrays, linked lists, trees, graphs, and hash maps in JavaScript.', provider: 'freeCodeCamp', isFree: true },
  { title: 'Algorithms Visualized', skillName: 'Algorithms', level: 'intermediate', type: 'course', duration: '10 hours', description: 'Visual explanations of sorting, searching, graph algorithms, and dynamic programming.', provider: 'YouTube', isFree: true },
  { title: 'System Design Primer', skillName: 'System Design', level: 'intermediate', type: 'article', duration: '8 hours', description: 'Comprehensive guide to system design: load balancers, caching, databases, and scaling.', provider: 'GitHub', isFree: true },
  { title: 'System Design Interview Prep', skillName: 'System Design', level: 'advanced', type: 'course', duration: '15 hours', description: 'Practice real system design problems: URL shortener, chat system, newsfeed.', provider: 'Educative', isFree: false },
  { title: 'Docker for Beginners', skillName: 'Docker', level: 'beginner', type: 'course', duration: '6 hours', description: 'Learn Docker from scratch: containers, images, volumes, and Docker Compose.', provider: 'YouTube', isFree: true },
  { title: 'AWS Cloud Practitioner', skillName: 'AWS', level: 'beginner', type: 'course', duration: '20 hours', description: 'AWS fundamentals: EC2, S3, RDS, Lambda, and cloud architecture basics.', provider: 'AWS', isFree: true },
  { title: 'Python for Data Science', skillName: 'Python', level: 'beginner', type: 'course', duration: '10 hours', description: 'Python basics for data science: NumPy, Pandas, and data manipulation.', provider: 'Kaggle', isFree: true },
  { title: 'Machine Learning Course', skillName: 'Machine Learning', level: 'beginner', type: 'course', duration: '16 hours', description: 'Andrew Ng-style ML course covering regression, classification, clustering, and neural networks.', provider: 'Coursera', isFree: true },
  { title: 'Data Visualization with Python', skillName: 'Data Visualization', level: 'intermediate', type: 'course', duration: '8 hours', description: 'Create beautiful charts with Matplotlib, Seaborn, and Plotly.', provider: 'DataCamp', isFree: false },
  { title: 'Cybersecurity Fundamentals', skillName: 'Cybersecurity', level: 'beginner', type: 'course', duration: '12 hours', description: 'Introduction to cybersecurity: threats, vulnerabilities, and defense strategies.', provider: 'Cybrary', isFree: true },
  { title: 'Linux Command Line', skillName: 'Linux', level: 'beginner', type: 'course', duration: '6 hours', description: 'Master the Linux terminal: file management, permissions, networking, and scripting.', provider: 'LinuxJourney', isFree: true },
  { title: 'REST API Design Best Practices', skillName: 'REST APIs', level: 'intermediate', type: 'article', duration: '3 hours', description: 'Design RESTful APIs that scale. Status codes, versioning, pagination, and HATEOAS.', provider: 'Blog', isFree: true },
];

// ═══════════════════════════════════════════════════════════
// SEED FUNCTION
// ═══════════════════════════════════════════════════════════
async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to:', mongoose.connection.name);

    // 1. Skills
    const existingSkills = await Skill.countDocuments();
    let skills;
    if (existingSkills === 0) {
      skills = await Skill.insertMany(skillsData);
      console.log(`✓ Seeded ${skills.length} skills`);
    } else {
      skills = await Skill.find();
      console.log(`→ ${existingSkills} skills already exist`);
    }

    // Build skill lookup
    const skillMap = {};
    skills.forEach((s) => { skillMap[s.name] = s._id; });

    // 2. Career Roles
    const existingCareers = await CareerRole.countDocuments();
    let careers;
    if (existingCareers === 0) {
      const careersToInsert = careerRolesData.map((cr) => ({
        ...cr,
        requiredSkills: cr.requiredSkills.map((rs) => ({
          skill: skillMap[rs.skillName],
          minimumScore: rs.minimumScore,
          importanceWeight: rs.importanceWeight,
        })).filter((rs) => rs.skill),
      }));
      careers = await CareerRole.insertMany(careersToInsert);
      console.log(`✓ Seeded ${careers.length} career roles`);
    } else {
      careers = await CareerRole.find();
      console.log(`→ ${existingCareers} career roles already exist`);
    }

    // Build career lookup
    const careerMap = {};
    careers.forEach((c) => { careerMap[c.title] = c._id; });

    // 3. Assessments
    const existingAssessments = await Assessment.countDocuments();
    if (existingAssessments === 0) {
      const assessmentEntries = Object.entries(assessmentQuestionsData);
      for (const [careerTitle, data] of assessmentEntries) {
        const questions = data.questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          skill: skillMap[q.skillName],
          difficulty: q.difficulty,
          explanation: q.explanation,
        }));
        await Assessment.create({
          title: data.title,
          description: data.description,
          careerRole: careerMap[careerTitle],
          questions,
          timeLimitMinutes: data.timeLimitMinutes,
          passingScore: data.passingScore,
        });
      }
      console.log(`✓ Seeded ${assessmentEntries.length} assessments`);
    } else {
      console.log(`→ ${existingAssessments} assessments already exist`);
    }

    // 4. Jobs
    const existingJobs = await Job.countDocuments();
    if (existingJobs === 0) {
      const jobsToInsert = jobsData.map((j) => ({
        ...j,
        requiredSkills: j.requiredSkills.map((skillName) => ({
          skill: skillMap[skillName],
          minimumScore: 50,
          importanceWeight: 1.0,
        })).filter((rs) => rs.skill),
        careerRole: careerMap[j.careerRole],
      }));
      const insertedJobs = await Job.insertMany(jobsToInsert);
      console.log(`✓ Seeded ${insertedJobs.length} jobs`);
    } else {
      console.log(`→ ${existingJobs} jobs already exist`);
    }

    // 5. Learning Resources
    const existingResources = await LearningResource.countDocuments();
    if (existingResources === 0) {
      const resourcesToInsert = learningResourcesData.map((r) => ({
        ...r,
        skill: skillMap[r.skillName],
      })).filter((r) => r.skill);
      const insertedResources = await LearningResource.insertMany(resourcesToInsert);
      console.log(`✓ Seeded ${insertedResources.length} learning resources`);
    } else {
      console.log(`→ ${existingResources} learning resources already exist`);
    }

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
