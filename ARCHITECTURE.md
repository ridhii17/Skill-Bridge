# SkillBridge AI — Architecture Document

> **Problem Statement:** SIH1628 — Smart Competency Diagnostic and Candidate Profile Score Calculator
> **Tech Stack:** MERN (MongoDB, Express.js, React, Node.js) — JavaScript only
> **Version:** 1.0.0

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                 │
│  Tailwind CSS · React Router · TanStack Query · Recharts│
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │Candidate │ │Mentor    │ │Recruiter │ │Admin      │  │
│  │Dashboard │ │Dashboard │ │Dashboard │ │Dashboard  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ Axios (JWT in HTTP-only cookies)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVER (Express.js + Node.js)           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              MIDDLEWARE LAYER                    │    │
│  │  CORS · Helmet · Rate Limiter · Cookie Parser   │    │
│  │  JWT Auth · Role Guard · Zod Validation         │    │
│  │  Centralized Error Handler · Request Logger     │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              ROUTE LAYER                        │    │
│  │  auth · candidates · competencies · careers     │    │
│  │  jobs · learning · assessments · ai · admin     │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              CONTROLLER LAYER                   │    │
│  │  Thin controllers — delegate to services        │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              SERVICE LAYER                      │    │
│  │                                                 │    │
│  │  ┌───────────────┐  ┌────────────────────────┐  │    │
│  │  │ Deterministic │  │      AI Services       │  │    │
│  │  │   Algorithms  │  │   (LLM-powered, JS)    │  │    │
│  │  │               │  │                        │  │    │
│  │  │ CompetencyS-  │  │ ResumeAnalyzer         │  │    │
│  │  │   corer       │  │ SkillExtractor         │  │    │
│  │  │ SkillGap-     │  │ JobDescriptionParser   │  │    │
│  │  │   Calculator  │  │ RoadmapGenerator       │  │    │
│  │  │ JobMatcher    │  │ CareerAdvisor          │  │    │
│  │  │ RankingEngine │  │ RecommendationExplainer│  │    │
│  │  └───────────────┘  └────────────────────────┘  │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────────┐   │    │
│  │  │           Domain Services                │   │    │
│  │  │  AuthService · UserService               │   │    │
│  │  │  ProfileService · AssessmentService      │   │    │
│  │  │  CareerService · JobService              │   │    │
│  │  │  LearningService · AnalyticsService      │   │    │
│  │  │  FileService · EmailService              │   │    │
│  │  └──────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              MODEL LAYER (Mongoose)             │    │
│  │  User · CandidateProfile · Competency           │    │
│  │  CompetencyScore · Assessment · AssessmentAttempt│    │
│  │  TargetCareer · SkillGap · LearningPath          │    │
│  │  LearningResource · Job · JobMatch · CareerReady │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
   ┌──────────────┐      ┌──────────────┐
   │   MongoDB    │      │  External    │
   │  (Mongoose)  │      │  LLM API     │
   └──────────────┘      │  (server-key)│
                         └──────────────┘
```

---

## 2. Folder Structure

```
skillbridge-ai/
├── ARCHITECTURE.md
├── README.md
├── package.json                    # Root workspace config
├── .gitignore
├── .env.example
│
├── server/                         # Express.js backend
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js                # Entry point — boots Express
│   │   ├── app.js                  # Express app config & middleware
│   │   ├── config/
│   │   │   ├── index.js            # Central config (env vars, defaults)
│   │   │   ├── database.js         # MongoDB/Mongoose connection
│   │   │   └── cors.js             # CORS options
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification + cookie extraction
│   │   │   ├── role.js             # Role-based access control
│   │   │   ├── validate.js         # Zod/Joi validation wrapper
│   │   │   ├── rateLimiter.js      # Rate limiting configs
│   │   │   ├── errorHandler.js     # Centralized error handler
│   │   │   ├── upload.js           # Multer file upload config
│   │   │   └── logger.js           # Request logging
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js            # Route aggregator
│   │   │   ├── auth.routes.js
│   │   │   ├── candidate.routes.js
│   │   │   ├── competency.routes.js
│   │   │   ├── career.routes.js
│   │   │   ├── job.routes.js
│   │   │   ├── learning.routes.js
│   │   │   ├── assessment.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── mentor.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── candidate.controller.js
│   │   │   ├── competency.controller.js
│   │   │   ├── career.controller.js
│   │   │   ├── job.controller.js
│   │   │   ├── learning.controller.js
│   │   │   ├── assessment.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── mentor.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── profile.service.js
│   │   │   ├── assessment.service.js
│   │   │   ├── career.service.js
│   │   │   ├── job.service.js
│   │   │   ├── learning.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── file.service.js
│   │   │   └── email.service.js
│   │   │
│   │   ├── algorithms/             # Deterministic JS algorithms
│   │   │   ├── competencyScorer.js
│   │   │   ├── skillGapCalculator.js
│   │   │   ├── jobMatcher.js
│   │   │   ├── rankingEngine.js
│   │   │   └── readinessCalculator.js
│   │   │
│   │   ├── ai/                     # AI/LLM service agents
│   │   │   ├── client.js           # LLM API client (key stays server-side)
│   │   │   ├── prompts/            # Prompt templates
│   │   │   │   ├── resumeAnalysis.js
│   │   │   │   ├── skillExtraction.js
│   │   │   │   ├── jobDescription.js
│   │   │   │   ├── roadmapGeneration.js
│   │   │   │   ├── careerAdvice.js
│   │   │   │   └── recommendations.js
│   │   │   ├── resumeAnalyzer.js   # AI agent: resume understanding
│   │   │   ├── skillExtractor.js   # AI agent: skill extraction
│   │   │   ├── jobDescriptionParser.js  # AI agent: JD understanding
│   │   │   ├── roadmapGenerator.js # AI agent: learning path generation
│   │   │   ├── careerAdvisor.js    # AI agent: career guidance
│   │   │   └── recommendationExplainer.js  # AI agent: explanations
│   │   │
│   │   ├── models/                 # Mongoose schemas & models
│   │   │   ├── index.js            # Model registry/exports
│   │   │   ├── User.js
│   │   │   ├── CandidateProfile.js
│   │   │   ├── Competency.js
│   │   │   ├── CompetencyScore.js
│   │   │   ├── Assessment.js
│   │   │   ├── AssessmentAttempt.js
│   │   │   ├── TargetCareer.js
│   │   │   ├── SkillGap.js
│   │   │   ├── LearningPath.js
│   │   │   ├── LearningResource.js
│   │   │   ├── Job.js
│   │   │   ├── JobMatch.js
│   │   │   └── CareerReadiness.js
│   │   │
│   │   ├── schemas/                # Zod validation schemas
│   │   │   ├── auth.schema.js
│   │   │   ├── candidate.schema.js
│   │   │   ├── competency.schema.js
│   │   │   ├── career.schema.js
│   │   │   ├── job.schema.js
│   │   │   └── common.schema.js
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js         # Custom error class
│   │   │   ├── ApiResponse.js      # Standard response wrapper
│   │   │   ├── asyncHandler.js     # Async error wrapper
│   │   │   ├── constants.js        # App constants
│   │   │   ├── helpers.js          # General helpers
│   │   │   └── fileUtils.js        # File handling utils
│   │   │
│   │   └── seeders/                # DB seed data
│   │       ├── competencies.js     # Competency taxonomy
│   │       ├── careers.js          # Target career definitions
│   │       └── index.js            # Seed runner
│   │
│   └── uploads/                    # Local file storage (gitignored)
│       ├── resumes/
│       └── temp/
│
├── client/                         # React + Vite frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── main.jsx                # Entry point
│       ├── App.jsx                 # Root component + providers
│       ├── index.css               # Tailwind directives + globals
│       │
│       ├── api/                    # API client layer
│       │   ├── axios.js            # Axios instance with interceptors
│       │   ├── auth.api.js
│       │   ├── candidate.api.js
│       │   ├── competency.api.js
│       │   ├── career.api.js
│       │   ├── job.api.js
│       │   ├── learning.api.js
│       │   ├── assessment.api.js
│       │   ├── ai.api.js
│       │   └── admin.api.js
│       │
│       ├── hooks/                  # TanStack Query hooks
│       │   ├── useAuth.js
│       │   ├── useCandidate.js
│       │   ├── useCompetencies.js
│       │   ├── useCareer.js
│       │   ├── useJobs.js
│       │   ├── useLearning.js
│       │   ├── useAssessment.js
│       │   └── useAI.js
│       │
│       ├── pages/                  # Route-level components
│       │   ├── Landing.jsx
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   └── ForgotPassword.jsx
│       │   ├── candidate/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Profile.jsx
│       │   │   ├── CompetencyAssessment.jsx
│       │   │   ├── ScoreDashboard.jsx
│       │   │   ├── TargetCareer.jsx
│       │   │   ├── SkillGapAnalysis.jsx
│       │   │   ├── LearningPath.jsx
│       │   │   ├── JobMatches.jsx
│       │   │   └── CareerAdvisor.jsx
│       │   ├── mentor/
│       │   │   ├── Dashboard.jsx
│       │   │   └── CandidateReview.jsx
│       │   ├── recruiter/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── PostJob.jsx
│       │   │   ├── CandidateSearch.jsx
│       │   │   └── JobApplicants.jsx
│       │   ├── admin/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── UserManagement.jsx
│       │   │   └── Analytics.jsx
│       │   ├── jobs/
│       │   │   ├── JobListings.jsx
│       │   │   └── JobDetail.jsx
│       │   └── NotFound.jsx
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.jsx       # Main app shell
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Header.jsx
│       │   │   ├── MobileNav.jsx
│       │   │   └── Footer.jsx
│       │   │
│       │   ├── ui/                     # Reusable primitives
│       │   │   ├── Button.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Select.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Table.jsx
│       │   │   ├── Tabs.jsx
│       │   │   ├── Tooltip.jsx
│       │   │   ├── Spinner.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── ErrorBoundary.jsx
│       │   │   └── PageHeader.jsx
│       │   │
│       │   ├── charts/
│       │   │   ├── CompetencyRadar.jsx   # Radar/spider chart
│       │   │   ├── SkillGapBar.jsx       # Horizontal bar (gap viz)
│       │   │   ├── ScoreTrend.jsx        # Line chart (over time)
│       │   │   ├── ReadinessGauge.jsx    # Circular progress
│       │   │   ├── JobMatchCard.jsx      # Match score card
│       │   │   └── SkillDonut.jsx        # Donut chart
│       │   │
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── ProtectedRoute.jsx
│       │   │   │   └── RoleGate.jsx
│       │   │   ├── profile/
│       │   │   │   ├── ProfileForm.jsx
│       │   │   │   ├── ResumeUpload.jsx
│       │   │   │   └── SkillTags.jsx
│       │   │   ├── competency/
│       │   │   │   ├── AssessmentWizard.jsx
│       │   │   │   ├── ScoreCard.jsx
│       │   │   │   └── CompetencyGrid.jsx
│       │   │   ├── career/
│       │   │   │   ├── CareerSelector.jsx
│       │   │   │   ├── GapAnalysisView.jsx
│       │   │   │   └── ReadinessScore.jsx
│       │   │   ├── learning/
│       │   │   │   ├── RoadmapTimeline.jsx
│       │   │   │   ├── ResourceCard.jsx
│       │   │   │   └── ProgressTracker.jsx
│       │   │   ├── jobs/
│       │   │   │   ├── JobCard.jsx
│       │   │   │   ├── JobFilters.jsx
│       │   │   │   └── MatchBadge.jsx
│       │   │   └── ai/
│       │   │       ├── ChatInterface.jsx
│       │   │       └── RecommendationList.jsx
│       │   │
│       │   └── shared/
│       │       ├── SEO.jsx
│       │       └── LoadingScreen.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       │
│       ├── lib/
│       │   ├── constants.js
│       │   └── utils.js              # cn(), formatDate(), etc.
│       │
│       └── assets/
│           └── logo.svg
│
└── docs/
    └── api/
        └── API_REFERENCE.md
```

---

## 3. Database Models (Mongoose Schemas)

### 3.1 User

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },            // bcrypt hashed
  role: { type: String, enum: ['candidate','mentor','recruiter','admin'], default: 'candidate' },
  avatar: { type: String, default: null },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshTokens: [String],                               // For token rotation
  timestamps: true
}
```

### 3.2 CandidateProfile

```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true, unique: true },
  headline: String,                                      // e.g. "Full-Stack Developer"
  summary: String,
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number,
    gpa: Number
  }],
  experience: [{
    title: String,
    company: String,
    description: String,
    startDate: Date,
    endDate: Date,                                        // null = current
    isCurrent: Boolean
  }],
  resumeFile: String,                                    // Path to uploaded resume
  resumeText: String,                                    // Extracted text from resume
  extractedSkills: [{                                     // AI-extracted from resume
    skill: String,
    confidence: Number,                                  // 0-1 from AI
    source: { type: String, enum: ['resume','declared','assessment'] }
  }],
  preferredJobTypes: [String],                           // remote, hybrid, on-site
  preferredLocations: [String],
  expectedSalary: { min: Number, max: Number },
  linkedInUrl: String,
  portfolioUrl: String,
  timestamps: true
}
```

### 3.3 Competency (Taxonomy — seeded)

```javascript
{
  _id: ObjectId,
  name: { type: String, required: true, unique: true },  // e.g. "React.js"
  category: { type: String, required: true },             // "frontend","backend","devops","soft_skill"
  subcategory: String,                                    // "framework","language","tool"
  description: String,
  weight: { type: Number, default: 1.0, min: 0, max: 5 }, // Importance weight
  parentCompetency: { type: ObjectId, ref: 'Competency', default: null }, // For hierarchies
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

### 3.4 CompetencyScore

```javascript
{
  _id: ObjectId,
  candidate: { type: ObjectId, ref: 'CandidateProfile', required: true },
  competency: { type: ObjectId, ref: 'Competency', required: true },
  level: { type: String, enum: ['beginner','intermediate','advanced','expert'], required: true },
  score: { type: Number, required: true, min: 0, max: 100 },  // Weighted score
  assessedVia: { type: String, enum: ['self','assessment','resume'] },
  lastAssessed: Date,
  history: [{                                               // Track progression
    score: Number,
    level: String,
    date: Date,
    assessedVia: String
  }],
  timestamps: true
}
// Compound index: { candidate: 1, competency: 1 } unique
```

### 3.5 Assessment

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },
  description: String,
  competency: { type: ObjectId, ref: 'Competency', required: true },
  difficulty: { type: String, enum: ['beginner','intermediate','advanced','expert'] },
  type: { type: String, enum: ['mcq','coding','practical','portfolio'] },
  questions: [{
    questionText: String,
    type: { type: String, enum: ['mcq','short_answer','code','practical'] },
    options: [String],                                     // For MCQ
    correctAnswer: String,
    points: { type: Number, default: 1 },
    skillTag: String                                       // Fine-grained skill
  }],
  timeLimitMinutes: { type: Number, default: 30 },
  passingScore: { type: Number, default: 60 },
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

### 3.6 AssessmentAttempt

```javascript
{
  _id: ObjectId,
  candidate: { type: ObjectId, ref: 'CandidateProfile', required: true },
  assessment: { type: ObjectId, ref: 'Assessment', required: true },
  answers: [{
    questionIndex: Number,
    answer: String,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: Number,                                          // Calculated: deterministic
  percentage: Number,
  passed: Boolean,
  timeTakenSeconds: Number,
  startedAt: Date,
  completedAt: Date,
  status: { type: String, enum: ['in_progress','completed','timed_out'] },
  timestamps: true
}
```

### 3.7 TargetCareer

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },               // "Full-Stack Developer"
  description: String,
  industry: String,
  averageSalary: { min: Number, max: Number, currency: String },
  requiredCompetencies: [{
    competency: { type: ObjectId, ref: 'Competency' },
    minimumLevel: { type: String, enum: ['beginner','intermediate','advanced','expert'] },
    weight: Number                                        // Importance for this career
  }],
  recommendedCompetencies: [{
    competency: { type: ObjectId, ref: 'Competency' },
    minimumLevel: String
  }],
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

### 3.8 SkillGap

```javascript
{
  _id: ObjectId,
  candidate: { type: ObjectId, ref: 'CandidateProfile', required: true },
  targetCareer: { type: ObjectId, ref: 'TargetCareer', required: true },
  gaps: [{
    competency: { type: ObjectId, ref: 'Competency' },
    requiredLevel: String,
    currentLevel: String,
    gapScore: Number,                                      // Deterministic calc
    priority: { type: String, enum: ['critical','important','nice_to_have'] }
  }],
  overallGapScore: Number,                                 // Aggregate gap metric
  matchPercentage: Number,                                 // How much they already match
  lastCalculated: Date,
  timestamps: true
}
// Compound index: { candidate: 1, targetCareer: 1 } unique
```

### 3.9 LearningPath

```javascript
{
  _id: ObjectId,
  candidate: { type: ObjectId, ref: 'CandidateProfile', required: true },
  targetCareer: { type: ObjectId, ref: 'TargetCareer', required: true },
  title: String,                                           // AI-generated
  description: String,                                     // AI-generated
  phases: [{
    phaseNumber: Number,
    title: String,
    description: String,                                   // AI-generated explanation
    skillsToAcquire: [{ competency: ObjectId, targetLevel: String }],
    resources: [{                                           // Mixed deterministic + AI
      type: { type: String, enum: ['course','article','project','practice','video','book'] },
      title: String,
      url: String,
      description: String,
      estimatedHours: Number,
      priority: Number
    }],
    estimatedDuration: String,                              // "2 weeks", "1 month"
    milestones: [String]
  }],
  totalEstimatedDuration: String,
  currentPhase: { type: Number, default: 1 },
  status: { type: String, enum: ['active','paused','completed','abandoned'] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  timestamps: true
}
```

### 3.10 LearningResource

```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },
  type: { type: String, enum: ['course','article','video','book','project','practice','certification'] },
  url: String,
  provider: String,                                        // "Udemy", "freeCodeCamp", etc.
  competencies: [{ type: ObjectId, ref: 'Competency' }],
  difficulty: { type: String, enum: ['beginner','intermediate','advanced','expert'] },
  estimatedHours: Number,
  rating: Number,
  isFree: { type: Boolean, default: true },
  description: String,
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

### 3.11 Job

```javascript
{
  _id: ObjectId,
  recruiter: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: String,
  description: { type: String, required: true },          // Full JD text
  location: String,
  type: { type: String, enum: ['full_time','part_time','contract','internship','remote'] },
  salary: { min: Number, max: Number, currency: String },
  requiredCompetencies: [{
    competency: { type: ObjectId, ref: 'Competency' },
    minimumLevel: String,
    weight: Number
  }],
  experienceRequired: { min: Number, max: Number },       // years
  educationRequired: String,
  benefits: [String],
  status: { type: String, enum: ['active','paused','closed','draft'], default: 'active' },
  applicantsCount: { type: Number, default: 0 },
  postedAt: Date,
  closesAt: Date,
  timestamps: true
}
```

### 3.12 JobMatch

```javascript
{
  _id: ObjectId,
  candidate: { type: ObjectId, ref: 'CandidateProfile', required: true },
  job: { type: ObjectId, ref: 'Job', required: true },
  matchScore: Number,                                      // Deterministic weighted calc
  competencyMatch: Number,                                 // % of required skills matched
  experienceMatch: Number,
  educationMatch: Number,
  missingSkills: [{ competency: ObjectId, requiredLevel: String }],
  strongSkills: [{ competency: ObjectId, level: String }],
  recommendation: String,                                  // AI-generated explanation
  appliedAt: Date,
  status: { type: String, enum: ['recommended','viewed','applied','shortlisted','rejected'] },
  timestamps: true
}
// Compound index: { candidate: 1, job: 1 } unique
```

### 3.13 CareerReadiness

```javascript
{
  _id: ObjectId,
  candidate: { type: ObjectId, ref: 'CandidateProfile', required: true },
  targetCareer: { type: ObjectId, ref: 'TargetCareer', required: true },
  overallScore: Number,                                    // 0-100, weighted composite
  competencyScore: Number,                                 // From competency assessments
  experienceScore: Number,
  educationScore: Number,
  assessmentScore: Number,
  learningProgress: Number,                                // Progress through learning path
  breakdown: {
    strongAreas: [{ area: String, score: Number }],
    weakAreas: [{ area: String, score: Number, recommendation: String }]
  },
  readinessLevel: { type: String, enum: ['not_ready','developing','approaching','ready','overqualified'] },
  lastUpdated: Date,
  scoreHistory: [{                                         // Track improvement
    overallScore: Number,
    date: Date
  }],
  timestamps: true
}
// Compound index: { candidate: 1, targetCareer: 1 } unique
```

---

## 4. API Design

### 4.1 Authentication (`/api/auth`)

| Method | Endpoint             | Auth Required | Roles       | Description                        |
|--------|----------------------|---------------|-------------|------------------------------------|
| POST   | /api/auth/register   | No            | —           | Register new user                  |
| POST   | /api/auth/login      | No            | —           | Login + set HTTP-only cookie       |
| POST   | /api/auth/logout     | Yes           | Any         | Clear cookie + invalidate refresh  |
| GET    | /api/auth/me         | Yes           | Any         | Get current user profile           |
| POST   | /api/auth/refresh    | Yes (cookie)  | Any         | Refresh JWT access token           |

**Auth Flow:**
```
Register → Hash password (bcrypt) → Create User → Set JWT in HTTP-only cookie
Login → Verify password → Generate JWT pair → Set access + refresh in HTTP-only cookies
API Request → Middleware extracts JWT from cookie → Verifies → Attaches req.user
Refresh → Verify refresh token → Rotate both tokens → Set new cookies
```

### 4.2 Candidates (`/api/candidates`)

| Method | Endpoint                     | Auth | Roles      | Description                   |
|--------|------------------------------|------|------------|-------------------------------|
| GET    | /api/candidates/profile      | Yes  | candidate  | Get own full profile          |
| PUT    | /api/candidates/profile      | Yes  | candidate  | Update profile                |
| POST   | /api/candidates/resume       | Yes  | candidate  | Upload & analyze resume       |
| GET    | /api/candidates/dashboard    | Yes  | candidate  | Dashboard summary data        |
| GET    | /api/candidates/scores       | Yes  | candidate  | All competency scores         |
| GET    | /api/candidates/:id         | Yes  | mentor,recruiter,admin | View candidate (filtered) |

### 4.3 Competencies (`/api/competencies`)

| Method | Endpoint                         | Auth | Roles    | Description                    |
|--------|----------------------------------|------|----------|--------------------------------|
| GET    | /api/competencies                | Yes  | Any      | List all competencies          |
| GET    | /api/competencies/categories     | Yes  | Any      | Grouped by category            |
| GET    | /api/competencies/:id            | Yes  | Any      | Single competency detail       |
| GET    | /api/competencies/search?q=      | Yes  | Any      | Search competencies            |

### 4.4 Assessments (`/api/assessments`)

| Method | Endpoint                         | Auth | Roles    | Description                    |
|--------|----------------------------------|------|----------|--------------------------------|
| GET    | /api/assessments                 | Yes  | Any      | List available assessments     |
| GET    | /api/assessments/:id             | Yes  | Any      | Get assessment (questions)     |
| POST   | /api/assessments/:id/start       | Yes  | candidate | Begin assessment attempt      |
| POST   | /api/assessments/:id/submit      | Yes  | candidate | Submit answers → deterministic scoring |
| GET    | /api/assessments/history         | Yes  | candidate | Past attempts + scores        |
| POST   | /api/assessments                 | Yes  | admin    | Create assessment (admin)      |

### 4.5 Careers (`/api/careers`)

| Method | Endpoint                         | Auth | Roles    | Description                    |
|--------|----------------------------------|------|----------|--------------------------------|
| GET    | /api/careers                     | Yes  | Any      | List target careers            |
| GET    | /api/careers/:id                 | Yes  | Any      | Career details + requirements  |
| POST   | /api/careers/target              | Yes  | candidate | Set a target career           |
| GET    | /api/careers/my-target           | Yes  | candidate | Get current target career     |
| GET    | /api/careers/gap-analysis        | Yes  | candidate | Skill gap vs target career    |
| GET    | /api/careers/readiness           | Yes  | candidate | Career readiness score        |

### 4.6 Jobs (`/api/jobs`)

| Method | Endpoint                         | Auth | Roles      | Description                    |
|--------|----------------------------------|------|------------|--------------------------------|
| GET    | /api/jobs                        | Yes  | Any        | List jobs (filterable)         |
| GET    | /api/jobs/:id                    | Yes  | Any        | Job detail                     |
| POST   | /api/jobs                        | Yes  | recruiter  | Post a new job                 |
| PUT    | /api/jobs/:id                    | Yes  | recruiter  | Edit own job                   |
| DELETE | /api/jobs/:id                    | Yes  | recruiter  | Close/delete own job           |
| GET    | /api/jobs/matches                | Yes  | candidate  | Jobs matched to my profile     |
| POST   | /api/jobs/:id/apply              | Yes  | candidate  | Apply to job                   |
| GET    | /api/jobs/:id/applicants         | Yes  | recruiter  | List applicants                |

### 4.7 Learning (`/api/learning`)

| Method | Endpoint                         | Auth | Roles    | Description                    |
|--------|----------------------------------|------|----------|--------------------------------|
| GET    | /api/learning/path               | Yes  | candidate | My learning path               |
| POST   | /api/learning/path/generate      | Yes  | candidate | Generate/regenerate path (AI)  |
| PUT    | /api/learning/path/progress      | Yes  | candidate | Update phase progress          |
| GET    | /api/learning/resources          | Yes  | Any       | Browse learning resources      |
| GET    | /api/learning/recommendations    | Yes  | candidate | AI-recommended resources       |

### 4.8 AI (`/api/ai`) — Rate-limited aggressively

| Method | Endpoint                         | Auth | Roles    | Description                    |
|--------|----------------------------------|------|----------|--------------------------------|
| POST   | /api/ai/analyze-resume           | Yes  | candidate | AI resume analysis             |
| POST   | /api/ai/extract-skills           | Yes  | candidate | AI skill extraction            |
| POST   | /api/ai/generate-roadmap         | Yes  | candidate | AI learning roadmap            |
| POST   | /api/ai/career-advice            | Yes  | candidate | AI career guidance chat        |
| POST   | /api/ai/explain-recommendation   | Yes  | candidate | AI explains a recommendation   |

### 4.9 Mentor (`/api/mentor`)

| Method | Endpoint                         | Auth | Roles  | Description                    |
|--------|----------------------------------|------|--------|--------------------------------|
| GET    | /api/mentor/assigned             | Yes  | mentor | My assigned candidates         |
| GET    | /api/mentor/candidate/:id        | Yes  | mentor | View candidate detail          |
| POST   | /api/mentor/feedback             | Yes  | mentor | Give feedback to candidate     |
| GET    | /api/mentor/feedback/:candidateId| Yes  | mentor | View past feedback             |

### 4.10 Admin (`/api/admin`)

| Method | Endpoint                         | Auth | Roles  | Description                    |
|--------|----------------------------------|------|--------|--------------------------------|
| GET    | /api/admin/dashboard             | Yes  | admin  | System stats                   |
| GET    | /api/admin/users                 | Yes  | admin  | List all users                 |
| PUT    | /api/admin/users/:id/role        | Yes  | admin  | Change user role               |
| PUT    | /api/admin/users/:id/status      | Yes  | admin  | Activate/deactivate            |
| GET    | /api/admin/analytics             | Yes  | admin  | Platform analytics             |

---

## 5. AI Service Architecture

### 5.1 Key Principle

AI and deterministic logic are **strictly separated**.

**DETERMINISTIC (Pure JavaScript — `src/algorithms/`):**
- `competencyScorer.js` → Weighted score from assessment results
- `skillGapCalculator.js` → Gap = required - current (weighted by competency weight)
- `jobMatcher.js` → Composite match score from multiple weighted factors
- `rankingEngine.js` → Sort/rank using weighted multi-criteria scoring
- `readinessCalculator.js` → Overall readiness as weighted composite of all scores

**AI (LLM-powered — `src/ai/`):**
- Understanding unstructured text (resumes, job descriptions)
- Generating natural language explanations
- Creating personalized learning recommendations
- Career guidance conversation

### 5.2 LLM Client (`src/ai/client.js`)

```javascript
// Singleton LLM client — key ONLY in server .env
// Supports any OpenAI-compatible API (OpenAI, Groq, Together, etc.)
// Handles:
//   - Retry with exponential backoff
//   - Token counting / budget enforcement
//   - Response parsing (JSON mode)
//   - Rate limiting per-user
//   - Timeout management
```

### 5.3 AI Agent Design

Each agent is a focused JavaScript module with a single responsibility:

**ResumeAnalyzer** — `src/ai/resumeAnalyzer.js`
```
Input:  Raw resume text (extracted from uploaded PDF/DOCX)
Output: { summary, skills: [{name, confidence}], experience: [...], education: [...] }
Prompt: Structured extraction prompt with JSON output schema
```

**SkillExtractor** — `src/ai/skillExtractor.js`
```
Input:  Free text (resume, project descriptions, job descriptions)
Output: [{ skill, level, confidence, category }]
Prompt: Few-shot prompt mapping text to competency taxonomy
```

**JobDescriptionParser** — `src/ai/jobDescriptionParser.js`
```
Input:  Raw job description text
Output: { requirements: [...], niceToHaves: [...], insights: "..." }
Prompt: Structured extraction with mapping to competency IDs
```

**RoadmapGenerator** — `src/ai/roadmapGenerator.js`
```
Input:  { skillGaps: [...], currentLevel, targetCareer, preferences }
Output: { phases: [{title, description, skills, resources, duration}] }
Prompt: Detailed prompt with pedagogical best practices
FALLBACK: If LLM unavailable → deterministic template-based roadmap
```

**CareerAdvisor** — `src/ai/careerAdvisor.js`
```
Input:  { message, conversationHistory, candidateContext }
Output: { response, suggestions: [...] }
Prompt: System prompt with career coaching persona + candidate data context
```

**RecommendationExplainer** — `src/ai/recommendationExplainer.js`
```
Input:  { recommendationType, data (job match, skill gap, learning path) }
Output: { explanation: string, insights: string[] }
Prompt: Template-based prompt explaining a specific recommendation in plain language
```

### 5.4 AI Safety Measures

1. **API key is server-only** — Never passed to frontend; stored in `process.env`
2. **Per-user rate limiting** — Max 20 AI calls/hour per candidate
3. **Response validation** — Always validate LLM JSON output with Zod before using
4. **Graceful degradation** — If LLM fails, fall back to deterministic alternatives
5. **Input sanitization** — Strip prompt injection patterns from user input
6. **Cost tracking** — Log token usage per request for budget monitoring
7. **Caching** — Cache identical requests (same resume hash, same JD) for 24 hours

---

## 6. Deterministic Algorithm Design

### 6.1 Competency Scorer

```javascript
// competencyScorer.js
//
// Input:  candidateId, competencyId
// Logic:
//   1. Fetch all AssessmentAttempts for this candidate + competency
//   2. Weight recent attempts higher (exponential decay)
//   3. Factor in resume-declared skills (lower weight)
//   4. Factor in self-assessment (lowest weight)
//
//   score = (Σ(attempt.score * recency_weight * source_weight)) / Σ(source_weight)
//
// Output: { score: 0-100, level: beginner|intermediate|advanced|expert, confidence: 0-1 }
//
// Level thresholds: 0-25 beginner, 26-50 intermediate, 51-75 advanced, 76-100 expert
```

### 6.2 Skill Gap Calculator

```javascript
// skillGapCalculator.js
//
// Input:  candidateId, targetCareerId
// Logic:
//   1. Fetch TargetCareer.requiredCompetencies
//   2. Fetch CandidateProfile.competencyScores for each required competency
//   3. For each required competency:
//        gapScore = (requiredLevelNumeric - currentLevelNumeric) * competencyWeight
//   4. Sort by gapScore descending (biggest gaps first)
//   5. Categorize: critical (gap > 3), important (1-3), nice_to_have (< 1)
//
// Output: {
//   gaps: [{ competency, requiredLevel, currentLevel, gapScore, priority }],
//   overallGapScore: Number,
//   matchPercentage: Number  // How much of the career requirements they already meet
// }
```

### 6.3 Job Matcher

```javascript
// jobMatcher.js
//
// Input:  candidateId, jobId
// Logic:
//   competencyMatch = Σ(matched_competency_weight) / Σ(required_competency_weight) * 100
//   experienceMatch = min(candidate_years / required_years, 1) * 100
//   educationMatch  = binary (has_required_degree ? 100 : 0)
//   locationMatch   = candidate_prefers_location ? 100 : 0
//   salaryMatch     = in_range(candidate_expected, job_salary) ? 100 : 0
//
//   matchScore = (competencyMatch * 0.50)
//              + (experienceMatch  * 0.20)
//              + (educationMatch   * 0.10)
//              + (locationMatch    * 0.10)
//              + (salaryMatch      * 0.10)
//
// Output: { matchScore, competencyMatch, experienceMatch, missingSkills, strongSkills }
```

### 6.4 Readiness Calculator

```javascript
// readinessCalculator.js
//
// Input:  candidateId, targetCareerId
// Logic:
//   competencyScore  = avg of all relevant competency scores (weighted)
//   experienceScore  = years_of_experience / required_experience * 100 (capped at 100)
//   educationScore   = match score for education requirements
//   assessmentScore  = avg of recent assessment scores for relevant competencies
//   learningProgress = current_path.progress
//
//   overallScore = (competencyScore * 0.35)
//                + (experienceScore  * 0.15)
//                + (educationScore   * 0.10)
//                + (assessmentScore  * 0.25)
//                + (learningProgress * 0.15)
//
//   readinessLevel:
//     0-20:   not_ready
//     21-45:  developing
//     46-70:  approaching
//     71-90:  ready
//     91-100: overqualified
//
// Output: { overallScore, breakdown, readinessLevel, scoreHistory }
```

---

## 7. Authentication & Authorization

### 7.1 Security Architecture

```
┌──────────────────────────────────────────────────┐
│                  Security Layers                 │
│                                                  │
│  1. Helmet              → Security headers       │
│  2. CORS                → Origin restriction     │
│  3. Rate Limiting       → Request throttling     │
│  4. Zod Validation      → Input sanitization     │
│  5. JWT (HTTP-only)     → Session management     │
│  6. bcrypt              → Password hashing       │
│  7. Role Guards         → Authorization          │
│  8. Error Handler       → No info leakage        │
│  9. File Validation     → Upload security        │
│ 10. Audit Logging       → Action tracking        │
└──────────────────────────────────────────────────┘
```

### 7.2 JWT Strategy

```
Access Token:  15 min expiry  → Stored in HTTP-only cookie
Refresh Token: 7 days expiry  → Stored in HTTP-only cookie + DB (for revocation)

Cookie Settings:
  httpOnly: true
  secure: process.env.NODE_ENV === 'production'
  sameSite: 'strict'
  path: '/api'
  signed: true
```

### 7.3 Role-Based Access Control

```
middleware/role.js

Roles: candidate < mentor < recruiter < admin

Routes declare allowed roles:
  router.get('/admin/users', auth, role('admin'), adminController.getUsers)
  router.get('/mentor/candidates', auth, role('mentor'), mentorController.getCandidates)

Admin can access everything. Mentor can access mentor + candidate views.
```

### 7.4 Rate Limiting Config

```
rateLimiter.js

General API:     100 requests / 15 minutes per IP
Auth endpoints:  10 requests / 15 minutes per IP (brute force protection)
AI endpoints:    20 requests / hour per user
Upload endpoints: 5 requests / 15 minutes per user
```

---

## 8. Frontend Architecture

### 8.1 State Management Strategy

```
Server State:  TanStack Query (all API data)
Auth State:    React Context (AuthContext)
UI State:      Local component state (useState/useReducer)
Form State:    React Hook Form or controlled components
```

### 8.2 Route Structure

```jsx
<BrowserRouter>
  <Routes>
    {/* Public */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Protected — Any role */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        {/* Candidate routes */}
        <Route element={<RoleGate roles={['candidate']} />}>
          <Route path="/dashboard" element={<CandidateDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/assessments" element={<CompetencyAssessment />} />
          <Route path="/scores" element={<ScoreDashboard />} />
          <Route path="/careers" element={<TargetCareer />} />
          <Route path="/gap-analysis" element={<SkillGapAnalysis />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/job-matches" element={<JobMatches />} />
          <Route path="/career-advisor" element={<CareerAdvisor />} />
        </Route>

        {/* Mentor routes */}
        <Route element={<RoleGate roles={['mentor']} />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/candidates/:id" element={<CandidateReview />} />
        </Route>

        {/* Recruiter routes */}
        <Route element={<RoleGate roles={['recruiter']} />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/post-job" element={<PostJob />} />
          <Route path="/recruiter/candidates" element={<CandidateSearch />} />
          <Route path="/recruiter/jobs/:id/applicants" element={<JobApplicants />} />
        </Route>

        {/* Admin routes */}
        <Route element={<RoleGate roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### 8.3 Component Design Principles

- **UI primitives** (`components/ui/`) are pure presentational — no business logic
- **Feature components** (`components/features/`) encapsulate domain logic
- **Pages** compose feature components and handle route-level data fetching via hooks
- **Hooks** (`hooks/`) wrap TanStack Query mutations/queries for each API domain
- **API layer** (`api/`) wraps Axios — single source of truth for all HTTP calls

### 8.4 Chart Components (Recharts)

| Component         | Chart Type   | Purpose                                |
|-------------------|--------------|----------------------------------------|
| CompetencyRadar   | RadarChart   | Visualize competency levels as a spider |
| SkillGapBar       | BarChart     | Side-by-side required vs current       |
| ScoreTrend        | LineChart    | Competency score improvement over time |
| ReadinessGauge    | RadialBar    | Overall career readiness percentage    |
| JobMatchCard      | Custom       | Match score visualization per job      |
| SkillDonut        | PieChart     | Skill distribution by category         |

---

## 9. Seed Data Strategy

The application ships with a **seeded competency taxonomy** and **target careers**:

### Competency Categories
- **Frontend:** HTML, CSS, JavaScript, TypeScript, React, Vue, Angular, Tailwind CSS, Next.js
- **Backend:** Node.js, Express.js, Python (awareness), REST APIs, GraphQL, Microservices
- **Database:** MongoDB, PostgreSQL, MySQL, Redis, Firebase
- **DevOps:** Git, Docker, Kubernetes, CI/CD, AWS, Azure, Linux
- **Soft Skills:** Communication, Teamwork, Leadership, Problem Solving, Time Management
- **AI/ML:** Machine Learning, NLP, Computer Vision, Data Analysis (awareness level)

### Target Careers
- Full-Stack Developer
- Frontend Developer
- Backend Developer
- DevOps Engineer
- Data Analyst
- UI/UX Designer
- Mobile Developer
- Cloud Architect
- AI/ML Engineer
- Product Manager

---

## 10. Environment Variables

### Server `.env`
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/skillbridge

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AI/LLM
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini

# CORS
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 min
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_MAX=20
```

### Client `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=SkillBridge AI
```

---

## 11. Phased Implementation Plan

### Phase 1: Foundation (Sprint 1)
**Goal:** Working auth system + empty dashboards per role

| Step | Task                                        | Files                                           |
|------|---------------------------------------------|-------------------------------------------------|
| 1.1  | Monorepo scaffolding (root package.json, workspaces) | `package.json`, `client/package.json`, `server/package.json` |
| 1.2  | Server: Express + middleware stack           | `server/src/app.js`, `server/src/index.js`, `server/src/config/` |
| 1.3  | Server: MongoDB connection + Mongoose setup | `server/src/config/database.js`                 |
| 1.4  | Server: User model + auth service           | `server/src/models/User.js`, `server/src/services/auth.service.js` |
| 1.5  | Server: Auth routes + JWT cookies           | `server/src/routes/auth.routes.js`, `server/src/controllers/auth.controller.js` |
| 1.6  | Server: Middleware (auth, role, validate, errorHandler) | `server/src/middleware/*` |
| 1.7  | Server: Validation schemas (Zod)            | `server/src/schemas/auth.schema.js`             |
| 1.8  | Server: Role-based seed (admin user)        | `server/src/seeders/index.js`                   |
| 1.9  | Client: Vite + React + Tailwind setup       | `client/vite.config.js`, `client/tailwind.config.js`, `client/src/index.css` |
| 1.10 | Client: Axios instance + interceptors       | `client/src/api/axios.js`                       |
| 1.11 | Client: Auth context + hooks                | `client/src/context/AuthContext.jsx`, `client/src/hooks/useAuth.js` |
| 1.12 | Client: Login + Register pages              | `client/src/pages/auth/*`                       |
| 1.13 | Client: Layout shell + Sidebar + Header     | `client/src/components/layout/*`                |
| 1.14 | Client: Protected route + Role gate         | `client/src/components/features/auth/*`         |
| 1.15 | Client: Empty role dashboards               | `client/src/pages/candidate/Dashboard.jsx`, `mentor/`, `recruiter/`, `admin/` |

**Deliverable:** Users can register, login, and see a role-appropriate empty dashboard.

---

### Phase 2: Candidate Core (Sprint 2)
**Goal:** Profile, competencies, assessments, scoring

| Step | Task                                        | Files                                           |
|------|---------------------------------------------|-------------------------------------------------|
| 2.1  | CandidateProfile model + profile service    | `server/src/models/CandidateProfile.js`         |
| 2.2  | Candidate routes (profile CRUD)             | `server/src/routes/candidate.routes.js`         |
| 2.3  | Competency model + seed data                | `server/src/models/Competency.js`, `server/src/seeders/competencies.js` |
| 2.4  | Assessment + AssessmentAttempt models       | `server/src/models/Assessment.js`, `AssessmentAttempt.js` |
| 2.5  | Deterministic: CompetencyScorer algorithm   | `server/src/algorithms/competencyScorer.js`     |
| 2.6  | Assessment service + routes                 | `server/src/services/assessment.service.js`     |
| 2.7  | CompetencyScore model + routes              | `server/src/models/CompetencyScore.js`          |
| 2.8  | Client: Profile page + form                 | `client/src/pages/candidate/Profile.jsx`        |
| 2.9  | Client: Competency list + grid              | `client/src/components/features/competency/*`   |
| 2.10 | Client: Assessment wizard UI                | `client/src/components/features/competency/AssessmentWizard.jsx` |
| 2.11 | Client: Score dashboard + radar chart       | `client/src/pages/candidate/ScoreDashboard.jsx` |
| 2.12 | Client: Competency hook + API               | `client/src/hooks/useCompetencies.js`, `client/src/api/competency.api.js` |

**Deliverable:** Candidate can fill profile, take competency assessments, see scores with radar chart.

---

### Phase 3: AI Integration (Sprint 3)
**Goal:** Resume analysis, skill extraction, AI services wired up

| Step | Task                                        | Files                                           |
|------|---------------------------------------------|-------------------------------------------------|
| 3.1  | LLM client singleton                       | `server/src/ai/client.js`                       |
| 3.2  | Prompt templates library                    | `server/src/ai/prompts/*`                       |
| 3.3  | ResumeAnalyzer agent + file upload          | `server/src/ai/resumeAnalyzer.js`, `server/src/services/file.service.js` |
| 3.4  | SkillExtractor agent                       | `server/src/ai/skillExtractor.js`               |
| 3.5  | AI routes                                   | `server/src/routes/ai.routes.js`                |
| 3.6  | Client: Resume upload component             | `client/src/components/features/profile/ResumeUpload.jsx` |
| 3.7  | Client: Extracted skills display            | `client/src/components/features/profile/SkillTags.jsx` |
| 3.8  | Client: AI hook + API                       | `client/src/hooks/useAI.js`, `client/src/api/ai.api.js` |

**Deliverable:** Candidate uploads resume → AI extracts skills → skills displayed in profile.

---

### Phase 4: Career Intelligence (Sprint 4)
**Goal:** Target career, gap analysis, job matching, readiness

| Step | Task                                        | Files                                           |
|------|---------------------------------------------|-------------------------------------------------|
| 4.1  | TargetCareer model + seed data              | `server/src/models/TargetCareer.js`, `server/src/seeders/careers.js` |
| 4.2  | Deterministic: SkillGapCalculator           | `server/src/algorithms/skillGapCalculator.js`   |
| 4.3  | Deterministic: JobMatcher                   | `server/src/algorithms/jobMatcher.js`           |
| 4.4  | Deterministic: ReadinessCalculator          | `server/src/algorithms/readinessCalculator.js`  |
| 4.5  | SkillGap + CareerReadiness models           | `server/src/models/SkillGap.js`, `CareerReadiness.js` |
| 4.6  | Career service + routes                     | `server/src/services/career.service.js`         |
| 4.7  | Job model + JobMatch model                  | `server/src/models/Job.js`, `JobMatch.js`       |
| 4.8  | Job service + routes                        | `server/src/services/job.service.js`            |
| 4.9  | AI: RecommendationExplainer                 | `server/src/ai/recommendationExplainer.js`      |
| 4.10 | Client: Target career selector              | `client/src/pages/candidate/TargetCareer.jsx`   |
| 4.11 | Client: Gap analysis view (bar chart)       | `client/src/pages/candidate/SkillGapAnalysis.jsx` |
| 4.12 | Client: Job listings + detail pages         | `client/src/pages/jobs/*`                       |
| 4.13 | Client: Job matches page                    | `client/src/pages/candidate/JobMatches.jsx`     |
| 4.14 | Client: Readiness score display             | `client/src/components/features/career/ReadinessScore.jsx` |

**Deliverable:** Candidate picks target career → sees gap analysis → sees matched jobs → tracks readiness.

---

### Phase 5: Learning & Verification (Sprint 5)
**Goal:** Personalized learning path + skill verification

| Step | Task                                        | Files                                           |
|------|---------------------------------------------|-------------------------------------------------|
| 5.1  | LearningPath + LearningResource models      | `server/src/models/LearningPath.js`, `LearningResource.js` |
| 5.2  | AI: RoadmapGenerator agent                  | `server/src/ai/roadmapGenerator.js`             |
| 5.3  | AI: CareerAdvisor agent (chat)              | `server/src/ai/careerAdvisor.js`               |
| 5.4  | Learning service + routes                   | `server/src/services/learning.service.js`       |
| 5.5  | Client: Learning path timeline view         | `client/src/pages/candidate/LearningPath.jsx`   |
| 5.6  | Client: Progress tracker                    | `client/src/components/features/learning/ProgressTracker.jsx` |
| 5.7  | Client: Career advisor chat UI              | `client/src/pages/candidate/CareerAdvisor.jsx`  |
| 5.8  | Client: Chat interface component            | `client/src/components/features/ai/ChatInterface.jsx` |

**Deliverable:** Candidate gets AI-generated learning path → tracks progress → chats with career advisor.

---

### Phase 6: Multi-Role Dashboards (Sprint 6)
**Goal:** Mentor, Recruiter, Admin functionality

| Step | Task                                        | Files                                           |
|------|---------------------------------------------|-------------------------------------------------|
| 6.1  | Mentor service + routes                     | Mentor feedback, candidate viewing              |
| 6.2  | Recruiter: Job CRUD + applicant management  | Full recruiter workflows                        |
| 6.3  | Admin: User management + analytics          | `server/src/services/analytics.service.js`      |
| 6.4  | Client: Mentor dashboard + candidate review | `client/src/pages/mentor/*`                     |
| 6.5  | Client: Recruiter dashboard + post job      | `client/src/pages/recruiter/*`                  |
| 6.6  | Client: Admin dashboard + user management   | `client/src/pages/admin/*`                      |
| 6.7  | Client: All chart components                | `client/src/components/charts/*`                |

**Deliverable:** All four roles have functional dashboards with appropriate data.

---

### Phase 7: Polish & Production (Sprint 7)
**Goal:** UI refinement, performance, hardening

| Step | Task                                        |
|------|---------------------------------------------|
| 7.1  | Responsive design pass (mobile-first)       |
| 7.2  | Loading states + skeleton screens           |
| 7.3  | Error boundary + error pages                |
| 7.4  | Toast notifications for actions             |
| 7.5  | Empty states with illustrations             |
| 7.6  | SEO + meta tags                             |
| 7.7  | Performance audit (Lighthouse)              |
| 7.8  | Security audit checklist                    |
| 7.9  | API documentation (README tables)           |
| 7.10 | Seed data finalization + demo data script   |

---

## 12. Project Conventions

### Code Style
- **Functional components only** — No class components
- **Async/await** — No raw `.then()` chains
- **Destructure props** — In function signatures
- **Named exports** — Over default exports for components
- **Single responsibility** — One component/service per file
- **Consistent naming:** `camelCase` files, `PascalCase` components, `snake_case` DB fields where needed

### Error Handling Pattern
```javascript
// Server: asyncHandler wraps all controllers
// Controller catches service errors → throws ApiError
// Centralized errorHandler formats response
// Client: TanStack Query error handling via onError callbacks
```

### Response Format
```javascript
// Success:
{ success: true, data: {...}, message: "Optional" }
// Error:
{ success: false, error: { message: "...", code: "ERROR_CODE", details: [...] } }
// Paginated:
{ success: true, data: [...], pagination: { page, limit, total, totalPages } }
```

---

*This architecture document is the blueprint for SkillBridge AI. Implementation proceeds phase-by-phase following the plan in Section 11.*
