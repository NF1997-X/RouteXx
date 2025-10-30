# Overview

This full-stack web application provides a robust data management system for tabular data. It features a drag-and-drop interface for creating, editing, and organizing table rows and columns with support for various data types (text, numbers, currency, images). Key capabilities include real-time statistics, an image gallery with lightbox functionality, and comprehensive CRUD operations for both table structure and content. The project aims to deliver a highly interactive and visually appealing data management solution with a focus on user experience and expandability, operating in three distinct modes: Table View, Edit Mode, and Route Management Mode with Google Maps integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React with TypeScript (Vite for build)
- **UI**: Shadcn/ui (Radix UI primitives), Tailwind CSS for styling
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @hello-pangea/dnd

## Backend
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **API**: RESTful, Zod for validation
- **Storage**: In-memory (development), Drizzle ORM with PostgreSQL schema definitions
- **Development**: Hot reload with Vite integration

## Data Storage
- **Current**: In-memory using JavaScript Maps
- **Schema**: Drizzle ORM with PostgreSQL
- **Database**: Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit

## Authentication and Authorization
- **Current State**: No authentication implemented
- **Session Management**: Basic middleware with connect-pg-simple
- **Security**: CORS configuration

## UI/UX & Features
- **Design**: Premium UI components, deep black dark theme, gradient backgrounds, blue accents.
- **Branding**: FamilyMart logo (FamilyMart.png) with transparent background used across app: navigation header, shared table view, loading launcher screen with animated orbital effects, and data loading overlay with rotating rings.
- **Loading Screens**: Logo appears instantly; loading progress animations take 5 seconds with animated progress bar (0-100%), dynamic status messages (Initializing → Loading data → Processing → Almost there → Finalizing → Complete), and random rotating tips (10 helpful feature hints that change every 800ms) for optimal user experience.
- **Navigation**: Streamlined single dropdown menu (grid icon) consolidates all navigation options (Saved Links, Theme Toggle, Help, Edit Mode controls); saved share links auto-refresh list immediately after saving.
- **Table Management**: Drag-and-drop rows/columns, editable "No" column for sorting, per-user layout preferences.
- **Button UX**: Clean opacity-based feedback for add image button (no loading spinner), maintaining disabled state protection during mutations.
- **Data Types**: Support for text, numbers, currency, images, and videos.
- **Media**: Enhanced media upload system supporting various image/video formats from gallery or URL, large file support (base64 data URLs), comprehensive video playback.
- **Mapping**: Google Maps API integration with lorry-optimized route calculation (distance, toll prices, traffic-aware optimal routing), customizable marker colors (hex code support with color picker), enhanced fullscreen map view.
- **Tutorial System**: Interactive, context-aware tutorial with premium UI.
- **Header Content**: Multi-page carousel for dynamic header content with CRUD operations.
- **Calculations**: AI generator row (Totals) dynamically calculates based on visible filtered/searched data; Kilometer column functional with cumulative distance calculation and total including return trip to QL Kitchen.
- **Animations**: Smooth page transition animations; staggered entrance effects on main page (navigation fade-in, content slide-up, header carousel, and table sections).
- **Compatibility**: 
  - Safari/iPad compatibility fixes for backdrop-blur effects
  - iOS DialogContent optimization (InfoModal, MiniMap & ShareDialog): safe area insets for notch/home indicator, dynamic viewport height (dvh), smooth touch scrolling (-webkit-overflow-scrolling), overscroll behavior containment
  - iOS input zoom prevention: minimum 16px font size on all input fields
  - Enhanced touch performance: optimized tap highlights, webkit backdrop filters
  - iOS modal improvements: proper height calculation accounting for iOS UI elements, touch-action pan-y for better gesture handling
  - Fullscreen map view optimized for iOS with safe area support and responsive height calculations
- **Delivery Alternate System**: 3-color power button system with intelligent day-based sorting:
  - 🟢 **Green**: On-schedule entries (Normal all days, Alt 1 on Mon/Wed/Fri/Sun, Alt 2 on Tue/Thu/Sat) - opacity-60, sorted first
  - 🟡 **Yellow**: Off-schedule entries (Alt 1/Alt 2 on non-scheduled days) - opacity-60, sorted second (below on-schedule)
  - 🔴 **Red**: Inactive entries - full brightness (100%, no opacity reduction), sorted last at bottom
  - Automatic tier-based sorting: on-schedule → off-schedule → inactive
  - Edit mode uses compact dropdown (icons only: 🟢 green, 🟡 yellow for Alt 1 & Alt 2, 🔴 red)
  - 3-color system applies to ALL modes (regular view, shared view, edit mode)
  - "WH" route hidden from filter dropdown but visible in table rows
- **Active/Inactive Rows**: Toggle active state with visual feedback; inactive rows sort to bottom and are styled distinctly.
- **Table Layout**: Compact column spacing (header px-4, cells px-3, footer px-3) for improved readability; flexible column width.
- **Info Column**: Info column visible only in edit mode; info button always visible in action column with marker color customization.
- **Drag Handle**: Visual drag handle with cursor animation for improved UX.
- **Header Content**: Date/time display (with day of week) positioned at bottom right of content description area; live updates every second.
- **Footer**: Displays app version (v1.0.0) with editable company name/URL settings; animated entrance with gradient text effects.
- **Pagination**: Active page button uses same background as other buttons with slow blinking border animation (2s cycle) for visual indication.
- **Custom Table Lists**: Feature untuk create custom tables dengan selected locations:
  - **Design**: Custom tables are filtered views of main table - same columns (global table_columns), different rows (selected subset)
  - **List Page** (`/custom-tables`): Checkbox selection interface with simple header (logo + Home button only, Menu button completely replaced), optimized fast loading (spinner animation), Footer, and dark theme consistency
  - **View Page** (`/custom/:shareId`): Full DataTable component with all interactive features (search, filter, sort, pagination, kilometer calculation)
  - **Loading Animations**: Main table (5-second wave), Custom Table List (ripple animation with expanding circles), Custom Table View (ripple animation with expanding circles)
  - **Read-Only Mode**: Interactive viewing only - drag-and-drop, filters, search work but changes don't persist (same as shared links)
  - **Shareable Links**: 6-character random shareId for worldwide sharing (e.g., `/custom/ll7d4f`)
  - **CRUD Operations**: Full CRUD support - Create custom table from selected locations, Edit to update name/description/locations (add or remove locations), Delete custom tables from list page
  - **Navigation Structure**: Main table page uses Menu dropdown (Saved Links, Custom Tables, Theme, Help); Custom Table List page uses simple header with Home button only (no dropdown menu)
  - **Database Schema**: `custom_tables` (metadata: name, shareId, description), `custom_table_rows` (links to selected table_rows with cascade delete)
  - **iOS Compatibility**: Safe area support, dynamic viewport height (dvh), WebKit optimizations untuk all dialogs
  - **API Endpoints**: GET/POST `/api/custom-tables`, GET `/api/custom-tables/share/:shareId`, GET `/api/custom-tables/:id/rows`, PUT `/api/custom-tables/:id/rows` (edit locations), DELETE `/api/custom-tables/:id`
  - **Edit Feature**: Green edit button (pencil icon) pada each custom table card; opens edit dialog dengan pre-selected locations; users can update table name, description, and add/remove locations; changes saved with PUT endpoint

# External Dependencies

- **Database**: Neon Database (`@neondatabase/serverless`)
- **Image Gallery**: LightGallery (with zoom and thumbnail plugins)
- **Mapping**: Google Maps API (Routes API)
- **Fonts**: Google Fonts (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **UI Utilities**: clsx, class-variance-authority
- **Date Management**: Date-fns