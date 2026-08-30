# SkillBridge AI — Run Doc

## How to Reproduce Uncommitted Artifacts

No special artifacts needed — the workspace is the main checkout. Dependencies are already installed.

## How to Run the Server

### Backend (port 5000)

```bash
cd server
node src/index.js
```

### Frontend (port 5173)

```bash
cd client
npx vite --host
```

### Seed Database (if needed)

```bash
cd server
node src/seeders/careerRoleSeeder.js
node src/seeders/miniAssessmentSeeder.js
```

### Demo Accounts

| Role      | Email             | Password    |
|-----------|-------------------|-------------|
| Candidate | ridhi@test.com    | Secure123   |
| Recruiter | recruiter@test.com| Recruiter123|
| Admin     | admin@test.com    | Admin1234   |

### URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
