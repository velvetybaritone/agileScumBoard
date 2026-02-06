# AGILE SCRUM Dashboard - Architecture & Implementation Guide

## 📋 Project Overview

A production-grade, frontend-only multi-tenant SaaS application designed to simulate a real AGILE/SCRUM environment for educational purposes. Built with modern web technologies and following SaaS best practices.

## 🏗️ Architecture Overview

### Multi-Tenancy Design

This application implements **true multi-tenant architecture** at the frontend level:

1. **Tenant Isolation**: Each AGILE Group (tenant) has completely isolated data
2. **Storage Strategy**: Tenant-specific LocalStorage keys prevent data leakage
3. **Session Management**: Users are permanently bound to their tenant after registration
4. **No Cross-Tenant Access**: Impossible to view or modify other tenants' data (except for admin users)

### Admin Tenant & Analytics

The system includes a **special admin tenant** for instructors and administrators:

1. **Admin Tenant**: Users who select "Admin / Instructor" during registration gain admin privileges
2. **Cross-Tenant Access**: Admin users can view aggregated data from ALL tenants
3. **Analytics Dashboard**: Comprehensive stats page with visualizations and filters
4. **Student Tracking**: Monitor participation, task completion, and check-in rates
5. **Tenant Comparison**: Compare performance and engagement across different teams

**Key Admin Features**:
- **Overview Stats**: Total tasks, story points, students, check-ins across all tenants
- **Participation Tracking**: Daily check-in participation rates with historical trends
- **Task Distribution**: Visual breakdown of tasks by status for each tenant
- **Student Performance**: Individual student stats including check-in streaks and task completion
- **Filtering**: View data by specific tenant or all tenants combined

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand (lightweight, performant)
- **Drag & Drop**: @dnd-kit (modern, accessible)
- **Persistence**: LocalStorage (tenant-scoped)

## 📁 Project Structure

```
agileScumBoard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Protected routes group
│   │   │   ├── layout.tsx           # Auth wrapper & data loader
│   │   │   ├── dashboard/           # Kanban board page
│   │   │   │   └── page.tsx
│   │   │   ├── check-in/            # Daily check-in page
│   │   │   │   └── page.tsx
│   │   │   └── admin/               # Admin analytics page (admin-only)
│   │   │       └── page.tsx
│   │   ├── login/                   # Public login page
│   │   │   └── page.tsx
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Redirect to login
│   │   └── globals.css              # Global styles
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── dropdown-menu.tsx
│   │   ├── layout/
│   │   │   └── AppShell.tsx         # Main app layout with sidebar
│   │   ├── kanban/
│   │   │   ├── KanbanColumn.tsx     # Droppable column
│   │   │   ├── TaskCard.tsx         # Draggable task card
│   │   │   └── TaskDialog.tsx       # Task create/edit modal
│   │   ├── check-in/
│   │   │   ├── CheckInForm.tsx      # Daily standup form
│   │   │   └── CheckInList.tsx      # Check-in history
│   │   └── analytics/               # Admin analytics components
│   │       └── AnalyticsComponents.tsx  # Charts, tables, stats
│   │
│   └── lib/
│       ├── stores/                   # Zustand state stores
│       │   ├── authStore.ts         # Authentication & session
│       │   ├── taskStore.ts         # Kanban tasks
│       │   ├── checkInStore.ts      # Daily check-ins
│       │   └── analyticsStore.ts    # Cross-tenant analytics
│       ├── types/
│       │   └── index.ts             # TypeScript definitions
│       └── utils.ts                 # Helper functions
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.js                    # Next.js config
└── README.md                         # User documentation
```

## 🔐 Authentication System

### Mock Authentication Flow

```typescript
// First-time user (Regular Student)
1. User enters username + password
2. System detects new user
3. User selects AGILE Group (tenant)
4. User account created and bound to tenant
5. Session stored in LocalStorage

// First-time user (Admin/Instructor)
1. User enters username + password
2. System detects new user
3. User selects "Admin / Instructor" as AGILE Group
4. Admin account created with cross-tenant access
5. Session stored with admin privileges

// Returning user
1. User enters username + password
2. System finds existing user
3. Auto-loads their assigned tenant (or admin status)
4. Session restored
```

### Security Considerations

- **Mock-only**: Authentication is for demonstration purposes
- **No real validation**: Any password works (educational environment)
- **Tenant binding**: Once assigned, users cannot change tenants
- **Session persistence**: Uses LocalStorage (survives browser refresh)
- **Admin access**: Admin users have read-only access to all tenant data

## 🗄️ Data Storage Strategy

### LocalStorage Keys

```typescript
'agile_user_session'                    // Current user session
'agile_users'                           // Global user registry
'agile_tenant_{tenantId}_tasks'         // Tenant-specific tasks
'agile_tenant_{tenantId}_checkins'      // Tenant-specific check-ins
```

### Data Isolation

Each tenant's data is completely isolated:

```typescript
// Example: Two tenants, completely separate data
localStorage['agile_tenant_walmart_tasks']        // Walmart's tasks
localStorage['agile_tenant_3c-consulting_tasks']  // 3C's tasks
```

### Data Models

#### User
```typescript
{
  username: string;
  tenantId: TenantId;
  displayName: string;
  createdAt: string;
}
```

#### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'done';
  storyPoints: number;
  assignee: string;
  blockerDetails?: string;
  createdAt: string;
  tenantId: TenantId;
}
```

#### Daily Check-In
```typescript
{
  id: string;
  date: string;
  sprintWeek: string;
  username: string;
  displayName: string;
  whatIDidYesterday: string;
  whatIAmDoingToday: string;
  impediments: string;
  helpNeeded: string;
  tenantId: TenantId;
  createdAt: string;
}
```

## 🎯 Core Features

### 1. Kanban Board

**Columns**:
- Backlog
- To Do
- In Progress
- Blocked
- Done

**Features**:
- ✅ Drag-and-drop between columns
- ✅ Visual priority indicators (color-coded)
- ✅ Story points display
- ✅ Assignee avatars
- ✅ Blocker badges & details
- ✅ Create, edit, delete tasks
- ✅ Real-time column counts

**Drag & Drop Implementation**:
```typescript
// Uses @dnd-kit for accessibility and mobile support
- DndContext: Wraps the board
- Droppable: Each column
- Draggable: Each task card
- DragOverlay: Shows dragging preview
```

### 2. Daily Check-In

**Features**:
- ✅ One check-in per day per user
- ✅ Auto-filled date and user info
- ✅ Sprint week tracking
- ✅ Yesterday/Today/Impediments/Help sections
- ✅ Personal history view
- ✅ Team-wide visibility
- ✅ Visual status indicators

**Visibility**:
- Check-ins are visible to all team members in the same tenant
- Simulates real standup meetings
- Promotes transparency and collaboration

### 3. Admin Analytics (Admin Users Only)

**Access Control**:
- ✅ Only accessible to users in the "Admin / Instructor" tenant
- ✅ Automatic redirect for non-admin users
- ✅ Admin badge displayed in header
- ✅ Admin navigation link in sidebar

**Analytics Features**:
- ✅ **Overview Dashboard**: Total tasks, story points, students, and check-ins
- ✅ **Tenant Comparison Table**: Side-by-side stats for all AGILE groups
- ✅ **Task Distribution Charts**: Visual breakdown of task status per tenant
- ✅ **Participation Tracking**: Daily check-in participation rates (last 14 days)
- ✅ **Student Performance Table**: Individual stats with check-in streaks
- ✅ **Filtering**: View all tenants or filter by specific tenant
- ✅ **Real-time Data**: Refresh button to reload analytics
- ✅ **Empty States**: Graceful handling of no data scenarios

**Key Metrics**:
- Total tasks and story points across all tenants
- Active students and tenant count
- Blocked tasks requiring attention
- Check-in participation percentages
- Student check-in streaks (consecutive days)
- Task completion rates per tenant
- User engagement levels

**Data Aggregation**:
```typescript
// Analytics store loads data from ALL tenants
- Reads all tenant-specific LocalStorage keys
- Aggregates tasks and check-ins across tenants
- Calculates daily participation rates
- Computes per-user and per-tenant statistics
- Supports filtering and drill-down analysis
```

### 4. User Experience

**Professional SaaS UI**:
- Clean, modern design
- Responsive layout
- Smooth animations
- Empty states
- Loading states
- Error handling
- Consistent styling

**Navigation**:
- Top bar with tenant info
- Sidebar with active page highlighting
- User dropdown menu
- Quick logout

## 🔄 State Management (Zustand)

### Why Zustand?

1. **Lightweight**: ~1KB minified
2. **Simple API**: Less boilerplate than Redux
3. **TypeScript-first**: Excellent type inference
4. **No Context Provider**: Direct hook usage
5. **DevTools support**: Easy debugging

### Store Architecture

```typescript
// authStore.ts - Authentication & session
- session: Current user session
- login(): Handle authentication
- logout(): Clear session
- initializeSession(): Load from LocalStorage
- isAdmin(): Check if current user is admin

// taskStore.ts - Kanban tasks
- tasks: All tasks for current tenant
- loadTasks(): Load tenant-specific tasks
- addTask(): Create new task
- updateTask(): Modify existing task
- deleteTask(): Remove task
- moveTask(): Change task status (drag-drop)

// checkInStore.ts - Daily standups
- checkIns: All check-ins for current tenant
- loadCheckIns(): Load tenant-specific check-ins
- addCheckIn(): Submit new check-in
- hasCheckInToday(): Prevent duplicate submissions
- getCheckInsByUser(): User's history
- getRecentCheckIns(): Team feed

// analyticsStore.ts - Cross-tenant analytics (Admin only)
- tenantStats: Aggregated stats per tenant
- userStats: Individual student performance metrics
- checkInParticipation: Daily participation tracking
- loadAnalytics(): Load data from ALL tenants
- getTenantStats(): Filter by specific tenant
- getUserStats(): Filter by tenant or username
- getCheckInParticipation(): Historical participation data
```

## 🎨 Component Design

### UI Component Library (shadcn/ui)

**Philosophy**:
- Copy-paste components (not npm package)
- Full customization control
- Built on Radix UI (accessible)
- Styled with Tailwind CSS

**Components Used**:
- `Button`: Primary actions
- `Input`: Text fields
- `Textarea`: Multi-line input
- `Select`: Dropdowns
- `Dialog`: Modals
- `Card`: Content containers
- `DropdownMenu`: User menu

### Custom Components

**Layout Components**:
- `AppShell`: Main app wrapper with sidebar & header
- Protected route wrapper in dashboard layout

**Kanban Components**:
- `KanbanColumn`: Droppable column with status-based styling
- `TaskCard`: Draggable task with priority badges
- `TaskDialog`: Modal for create/edit with validation

**Check-In Components**:
- `CheckInForm`: Daily standup submission
- `CheckInList`: Historical view with filtering

**Analytics Components** (Admin only):
- `StatsCards`: Overview metrics with icons and colors
- `TenantStatsTable`: Comparison table for all tenants
- `UserStatsTable`: Student performance with streaks
- `TaskDistributionChart`: Horizontal bar chart by status
- `CheckInParticipationChart`: Daily participation visualization

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### First Run

1. Navigate to `http://localhost:3000`
2. Auto-redirects to `/login`
3. Enter any username and password
4. Select an AGILE Group (tenant)
5. Dashboard loads with empty Kanban board

### Testing Multi-Tenancy

```bash
# Test tenant isolation:
1. Create account: user1 → Select "Walmart"
2. Add some tasks to Walmart's board
3. Logout
4. Create account: user2 → Select "3C Consulting"
5. Observe: user2 sees empty board (different tenant)
6. Add tasks to 3C's board
7. Logout and login as user1
8. Observe: Only Walmart's tasks visible
```

### Testing Admin Analytics

```bash
# Test admin features:
1. Create several student accounts in different tenants
2. Have each student create tasks and daily check-ins
3. Create admin account: admin1 → Select "Admin / Instructor"
4. Observe: "Admin Analytics" link appears in sidebar
5. Navigate to Admin Analytics page
6. View aggregated stats from all tenants
7. Use tenant filter to drill down into specific groups
8. Verify check-in participation tracking
9. Check student performance table with streaks

# Test admin access control:
1. Login as regular student
2. Try to navigate to /admin
3. Observe: Automatic redirect to /dashboard
4. Admin Analytics link not visible in sidebar
```

## 🎓 Educational Concepts Demonstrated

### 1. Multi-Tenant SaaS Architecture
- Tenant isolation
- Data scoping
- Session management
- Role-based access control (Admin vs Student)
- Cross-tenant data aggregation

### 2. Modern React Patterns
- Server/Client components (Next.js 14)
- Custom hooks
- State management
- Form handling
- Conditional rendering based on user roles

### 3. TypeScript Best Practices
- Strict types
- Discriminated unions
- Type inference
- Interface design
- Generic types for reusable components

### 4. Data Visualization
- Chart components with pure CSS
- Progress bars and percentage indicators
- Color-coded status visualization
- Responsive table layouts
- Empty state handling

### 5. Drag & Drop Interactions
- Accessible DnD
- Touch support
- Visual feedback

### 6. AGILE Methodology
- Kanban workflow
- Daily standups
- Story points
- Sprint tracking
- Blocker management
- Performance metrics and analytics
- Team participation tracking

## 📝 Assumptions & Decisions

### Assumptions
1. **Educational context**: Not production security
2. **Local storage is acceptable**: No backend available
3. **Single-user sessions**: No concurrent users
4. **Browser storage limits**: Won't exceed LocalStorage quota
5. **Modern browser**: ES2017+ features available

### Key Decisions

**Why LocalStorage over SessionStorage?**
- Persistence across browser sessions
- Better simulation of real SaaS behavior
- User data survives page refresh

**Why no database/backend?**
- Frontend-only requirement
- Simulates SaaS without infrastructure
- Easier to deploy and share

**Why Zustand over Context?**
- Better performance (no re-render cascades)
- Simpler API for this use case
- Built-in persistence helpers

**Why @dnd-kit over react-beautiful-dnd?**
- react-beautiful-dnd is deprecated
- @dnd-kit has better accessibility
- Better mobile/touch support

## 🔧 Customization Guide

### Adding a New Tenant

```typescript
// src/lib/types/index.ts
export const TENANTS: Tenant[] = [
  // ... existing tenants
  { id: 'new-tenant', name: 'new-tenant', displayName: 'New Tenant' },
];
```

### Adding Kanban Columns

```typescript
// src/app/(dashboard)/dashboard/page.tsx
const columns = [
  // ... existing columns
  { id: 'review', title: 'In Review' },
];

// Update TaskStatus type
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'review' | 'done';
```

### Customizing Theme

```css
/* src/app/globals.css */
:root {
  --primary: 221.2 83.2% 53.3%;  /* Change primary color */
  --radius: 0.5rem;               /* Change border radius */
}
```

## 🐛 Troubleshooting

### Issue: Tasks not persisting
**Solution**: Check browser's LocalStorage limit and clear if needed

### Issue: Can't see other team members
**Solution**: Multiple users must be created in the same tenant

### Issue: Drag-and-drop not working
**Solution**: Ensure pointer events are enabled (browser setting)

### Issue: Login loops
**Solution**: Clear LocalStorage: `localStorage.clear()`

### Issue: Can't access Admin Analytics
**Solution**: Ensure you selected "Admin / Instructor" tenant during registration. Regular students cannot access admin features.

### Issue: Analytics showing no data
**Solution**: Create student accounts and add tasks/check-ins first. Admin can only see data that exists.

## 📊 Performance Considerations

### Optimizations Implemented
1. **Memoization**: useMemo for expensive computations
2. **Lazy loading**: Code splitting via Next.js
3. **Zustand**: Selective re-renders
4. **CSS**: Tailwind purges unused styles
5. **Analytics loading**: On-demand data aggregation only when admin page loads

### Scalability Notes
- LocalStorage has ~5-10MB limit
- Large datasets (1000+ tasks) may slow down
- Analytics aggregation scales linearly with tenant count
- Consider pagination for production use
- For large classes (100+ students), database backend recommended

## 🎯 Future Enhancement Ideas

**If this were a real product**:
1. Backend integration (REST API or GraphQL)
2. Real authentication (JWT, OAuth)
3. Database persistence (PostgreSQL, MongoDB)
4. Real-time updates (WebSockets)
5. File attachments on tasks
6. Sprint planning tools
7. Burndown charts and velocity tracking
8. Email notifications
9. Export/import functionality (CSV, PDF reports)
10. Mobile app (React Native)
11. **Admin enhancements**:
    - Custom date range filters for analytics
    - Export analytics reports for grading
    - Student activity timeline
    - Automated participation alerts
    - Comparative performance graphs
    - Custom metrics and KPIs
    - Tenant management (create, archive, delete)
    - Bulk user import

## 📚 Learning Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

Educational use only.

---

**Built with ❤️ for AGILE learning**
