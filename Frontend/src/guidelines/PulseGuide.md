# Pulse: Project Management Tool Guide

## Overview

**Pulse** is a minimalist project management tool designed for team collaboration and project tracking. It features a clean, monochromatic design with pure white backgrounds, subtle interactions, and generous whitespace. The interface supports both light and dark themes.

## Brand Identity

- **Name**: Pulse
- **Icon**: Lightning bolt (Zap) - representing energy and real-time updates
- **Design Philosophy**: Minimalist, clean, professional with maximum whitespace

## Current Interface Structure

### Main Layout (`/components/PulseLayout.tsx`)

The application uses a fixed sidebar navigation with four main sections:

1. **Team** - Team member management and overview
2. **Projects** - Project tracking with grid/list views
3. **Activity** - Real-time activity feed and timeline
4. **Settings** - Application preferences and configurations

#### Sidebar Features:
- Fixed left sidebar (264px width)
- Active section highlighted with inverted colors
- User profile section at bottom (Alex Morgan - Project Manager)
- Sign out button
- Dark mode support throughout

### 1. Team Management (`/components/TeamManagement.tsx`)

**Features:**
- Grid layout of team member cards
- Add, edit, and delete team members
- Member information: name, role, email, status, tasks completed
- Status indicators (Active, Offline, Away)

**Data Structure:**
```typescript
interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Offline' | 'Away';
  tasksCompleted: number;
  avatar: string; // initials
}
```

**To Manage Team Members:**
1. Click "Add Member" button to create new members
2. Use dropdown menu (three dots) on each card to edit or delete
3. Members stored in component state (can be connected to database)

### 2. Project Management (`/components/ProjectManagement.tsx`)

**Features:**
- Toggle between Grid and List views
- Progress tracking with visual progress bars
- Task completion ratios
- Due dates and status labels
- CRUD operations for projects

**View Modes:**
- **Grid View**: Card-based layout (2 columns on large screens)
- **List View**: Table format with sortable columns

**Data Structure:**
```typescript
interface Project {
  id: number;
  name: string;
  progress: number;
  tasks: { completed: number; total: number };
  status: string;
  dueDate: string;
}
```

**To Manage Projects:**
1. Use Grid/List toggle in header to switch views
2. Click "Add Project" to create new projects
3. Set project details: name, due date, tasks, progress
4. Edit/delete via dropdown menu on each project

### 3. Activity Management (`/components/ActivityManagement.tsx`)

**Features:**
- Real-time activity timeline
- Filter by activity type (All, Tasks, Projects, Members, Comments)
- Color-coded activity indicators
- User attribution for each activity
- Time stamps (relative time)

**Activity Types:**
- Task completion
- Project updates
- Team member changes
- Document uploads
- Comments and discussions

**Data Structure:**
```typescript
interface Activity {
  id: number;
  type: 'task' | 'project' | 'member' | 'document' | 'comment';
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color?: string;
  user?: string;
}
```

### 4. Settings Panel (`/components/SettingsPanel.tsx`)

**Categories:**

#### Appearance
- **Dark Mode Toggle**: Switch between light/dark themes
  - Persists in localStorage
  - Applies to entire application
  - Icons change (Sun/Moon) based on current theme
- Compact view option
- Activity indicator toggles

#### Notifications
- Email notifications toggle
- Task assignment alerts
- Project update notifications

#### Security
- Two-factor authentication toggle
- Session timeout settings
- Password change functionality

#### Data Management
- Export team data
- Export project data
- Delete all data (destructive action)

#### Email Settings
- Primary email configuration
- Support email setup

## Theme System

### Light Theme (Default)
- Background: Pure white (`#ffffff`)
- Text: Slate shades (`slate-900`, `slate-600`, `slate-500`)
- Borders: Light slate (`slate-200`)
- Accents: Dark slate (`slate-900`)

### Dark Theme
- Background: Dark slate (`slate-900`)
- Text: Light slate (`slate-100`, `slate-400`)
- Borders: Medium slate (`slate-700`)
- Accents: Light slate (`slate-100`)

**Implementation:**
- Theme state managed in `/App.tsx`
- Persisted to localStorage
- Applied via `.dark` class on document root
- CSS variables in `/styles/globals.css`

## Design Guidelines

### Typography
- No custom font size/weight classes unless explicitly needed
- Default typography defined in `globals.css`
- Headings: h1, h2, h3 with medium weight
- Body text: Regular weight with consistent line-height

### Spacing
- Generous whitespace throughout
- Padding: `p-12` for main content areas
- Gaps: `gap-6` for grids, `gap-3` for inline elements
- Margins: `mb-8` for section headers

### Colors
- Monochromatic slate palette
- Minimal use of color for status indicators
- Destructive actions: Red (`red-600`)
- Success states: Subtle slate variations

### Components
- Rounded corners: `rounded-lg`
- Borders: 1px slate borders
- Shadows: Minimal to none
- Hover states: Subtle background changes

## Data Flow

Currently, all data is managed via React state within components. For production:

1. **Recommended Backend**: Supabase
2. **State Management**: Consider Context API or Zustand for shared state
3. **Data Persistence**: Connect to REST APIs or GraphQL
4. **Real-time Updates**: WebSocket for activity feed

## Component Structure

```
/components
├── PulseLayout.tsx         # Main layout with sidebar
├── TeamManagement.tsx      # Team member CRUD
├── ProjectManagement.tsx   # Project tracking
├── ActivityManagement.tsx  # Activity timeline
├── SettingsPanel.tsx       # App settings
└── ui/                     # shadcn/ui components
```

## Future Enhancements

### Authentication
- User login/logout functionality
- Role-based access control (Project Manager, Team Member, Viewer)
- Session management
- Password reset flows

### Collaboration
- Real-time updates across users
- Comments and discussions
- File attachments
- @mentions and notifications

### Advanced Features
- Gantt chart view for projects
- Kanban board integration
- Time tracking
- Reports and analytics
- Export to PDF/CSV
- Calendar integration

### Mobile Experience
- Responsive sidebar (hamburger menu)
- Touch-optimized interactions
- Mobile-specific layouts
- Progressive Web App (PWA) support

## Technical Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State**: React Hooks (useState, useEffect)
- **Storage**: localStorage for theme preference

## Getting Started

1. **Installation**: All dependencies are pre-configured
2. **Development**: The app runs in browser-based development environment
3. **Customization**: Modify component files to adjust functionality
4. **Theming**: Use theme toggle in Settings or modify CSS variables
5. **Data**: Update mock data arrays in component files

## Support & Documentation

For component-specific documentation, refer to:
- shadcn/ui documentation for UI components
- Tailwind CSS v4.0 documentation for styling
- React documentation for hooks and patterns
- Lucide React for icon usage

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Product Name**: Pulse
