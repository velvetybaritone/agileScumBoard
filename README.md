# AGILE SCRUM Dashboard - Multi-Tenant SaaS

A multi-tenant SaaS AGILE SCRUM triage dashboard designed for students to simulate a real AGILE environment alongside serving their internships.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Persistence**: LocalStorage
- **Drag & Drop**: @dnd-kit

## Features

### Multi-Tenant Architecture

- 8 AGILE Groups (tenants): Walmart, 3C Consulting, Primary Battery Technology, WAC/AMP, COB, Echelon, Arvest, Startup Lab
- **Admin / Instructor** tenant for cross-tenant analytics
- Full tenant isolation in state and storage
- Regular users can only see data for their assigned tenant
- Admin users can view aggregated data from all tenants

### Authentication

- Mock username/password login
- AGILE Group assignment on first login
- Session persistence via LocalStorage
- Role-based access (Student vs Admin/Instructor)

### Kanban Board (Per Tenant)

- 5 columns: Backlog, To Do, In Progress, Blocked, Done
- Drag-and-drop task management
- Task properties: Title, Description, Priority, Story Points, Assignee, Blocker Details
- Visual priority indicators
- Clearly marked blocked tasks

### Daily Check-In (Per User, Shared with Team)

- Daily standup tracking
- Fields: Date, Sprint Week, What I Did Yesterday, What I'm Doing Today, Impediments, Help Needed
- Visible to all team members in the same tenant
- Historical view

### Admin Analytics (Admin/Instructor Only)

- **Overview Dashboard**: Total tasks, story points, students, and check-ins across all tenants
- **Participation Tracking**: Daily check-in participation rates with 14-day history
- **Task Distribution**: Visual breakdown of task status by tenant
- **Student Performance**: Individual stats including check-in streaks and task completion
- **Tenant Comparison**: Side-by-side statistics for all AGILE groups
- **Filtering**: View all tenants or drill down to specific groups
- **Real-time Refresh**: Update analytics on demand

## Getting Started

1. Install dependencies:

```bash
npm install
```

1. Run the development server:

```bash
npm run dev
```

1. Open [http://localhost:3000](http://localhost:3000)

## Usage

### For Students

1. **First Login**: Enter username and password, select your AGILE Group
2. **Kanban Board**: Create and manage tasks, drag between columns
3. **Daily Check-In**: Submit daily standup reports (one per day)
4. **Team Collaboration**: View your team members' check-ins

### For Instructors/Admins

1. **First Login**: Enter username and password, select **"Admin / Instructor"** as your AGILE Group
2. **Admin Badge**: Notice the purple "ADMIN" badge in the header
3. **Admin Analytics**: Click "Admin Analytics" in the sidebar
4. **View Statistics**:
   - Overview metrics across all tenants
   - Task distribution by status
   - Daily check-in participation rates
   - Individual student performance and streaks
5. **Filter Data**: Use tenant filter to focus on specific groups
6. **Refresh**: Click refresh button to reload latest data

**Note**: Admin users have read-only access to all tenant data for monitoring and grading purposes.

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/         # Main dashboard (Kanban)
│   ├── check-in/          # Daily check-in
│   ├── admin/             # Admin analytics (admin-only)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── kanban/           # Kanban board components
│   ├── check-in/         # Check-in components
│   ├── analytics/        # Admin analytics components
│   └── layout/           # Layout components
├── lib/                   # Utilities
│   ├── stores/           # Zustand stores
│   │   ├── authStore.ts        # Auth & session
│   │   ├── taskStore.ts        # Kanban tasks
│   │   ├── checkInStore.ts     # Daily check-ins
│   │   └── analyticsStore.ts   # Admin analytics
│   ├── types/            # TypeScript types
│   └── utils.ts          # Helper functions
└── styles/               # Global styles
```

## Multi-Tenant Data Isolation

Data is stored in LocalStorage with tenant-specific keys:

- `agile_user_session` - Current user session
- `agile_tenant_{tenantId}_tasks` - Tenant-specific tasks
- `agile_tenant_{tenantId}_checkins` - Tenant-specific check-ins
- `agile_users` - Global user registry (username -> tenant mapping)

## QA & Testing

This application has undergone comprehensive QA analysis to ensure production-readiness:

### QA Report
See [QA_REPORT.md](QA_REPORT.md) for detailed analysis including:
- 23 issues identified and fixed across all severity levels
- Security enhancements (XSS prevention, input validation)
- SSR compatibility fixes
- Error handling improvements
- Accessibility enhancements
- Performance optimizations

### Testing Checklist
See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for comprehensive test scenarios:
- 150+ test cases covering all features
- Multi-tenancy isolation verification
- Security testing procedures
- Cross-browser compatibility checks
- Accessibility validation

### Key Improvements
- ✅ SSR-safe localStorage access
- ✅ Type-safe throughout (no 'as any')
- ✅ Input sanitization against XSS
- ✅ Error boundaries for crash recovery
- ✅ Keyboard accessibility
- ✅ Comprehensive validation utilities

## Usage

1. **First Login**: Enter username, password, and select your AGILE Group
2. **Subsequent Logins**: Enter username and password (group is remembered)
3. **Kanban Board**: Manage tasks via drag-and-drop
4. **Daily Check-In**: Submit daily standup updates
5. **Logout**: Clears session, requires re-login
