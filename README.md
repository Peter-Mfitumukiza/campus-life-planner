# Campus Life Planner

A clean, accessible web application for managing campus tasks and events. Built with vanilla HTML, CSS, and JavaScript for a front-end web development course.

**Live Demo:** [https://peter-mfitumukiza.github.io/campus-life-planner/](https://peter-mfitumukiza.github.io/campus-life-planner/)

**Demo Video:** [Coming Soon]

## Project Overview

Campus Life Planner helps students organize their academic tasks efficiently. Track assignments, study sessions, meetings, and events with duration tracking, tags, and regex-powered search.

## Features

- Add, edit, and delete tasks with due dates and durations
- Organize with customizable tags (Study, Assignment, Exam, etc.)
- Advanced regex search with pattern highlighting
- Visual dashboard with statistics and trends
- Manual theme toggle (light/dark mode)
- Data persistence with localStorage
- Import/Export JSON for backups
- Fully keyboard accessible
- Responsive design (mobile, tablet, desktop)

## Regex Validation

The app uses 5 regex patterns for form validation:

### 1. Title Validation
**Pattern:** `/^\S(?:.*\S)?$/`
- No leading or trailing spaces
- Example: "Study Session" ✓, " Study " ✗

### 2. Duration Validation
**Pattern:** `/^(0|[1-9]\d*)$/`
- Positive integer minutes only
- Example: "120" ✓, "01" ✗

### 3. Date Validation
**Pattern:** `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
- YYYY-MM-DD format
- Example: "2025-10-20" ✓

### 4. Tag Validation
**Pattern:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
- Letters, spaces, and hyphens only
- Example: "Study-Group" ✓, "Study123" ✗

### 5. Duplicate Words Detection (Advanced)
**Pattern:** `/\b(\w+)\s+\1\b/i`
- Uses back-reference to catch duplicate words
- Example: "the the test" → detected

## Regex Search

The search feature supports powerful regex patterns:

- `Study|Exam` - Find tasks with "Study" OR "Exam"
- `@tag:Study` - Special pattern to filter by tag
- `\b\d{2}:\d{2}\b` - Find time tokens like "14:30"
- `^Complete` - Tasks starting with "Complete"

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Navigate elements |
| Enter | Submit / Activate |
| Escape | Close modal |
| Ctrl/Cmd + K | Focus search |
| Space | Toggle checkboxes |

## Getting Started

### Running Locally

1. Clone this repository
2. Open `index.html` in your browser, or run a local server:
   ```bash
   python -m http.server 8000
   ```
3. Import sample data from `seed.json` via Settings

### Testing Validation

Open `tests.html` in your browser to see all validation tests (45 tests total).

## Project Structure

```
├── index.html          # Main app
├── tests.html          # Test suite
├── seed.json           # Sample data 
├── styles/
│   ├── main.css        # Core styles
│   └── responsive.css  # Media queries
└── scripts/
    ├── app.js          # Main logic
    ├── state.js        # State management
    ├── storage.js      # localStorage
    ├── validators.js   # Regex rules
    ├── search.js       # Search & highlight
    └── ui.js           # DOM updates
```

## Data Model

```javascript
{
  id: "task_1729008000000_123",
  title: "Study for Chemistry Midterm",
  dueDate: "2025-10-20",
  duration: 180,
  tag: "Study",
  createdAt: "2025-10-15T08:00:00Z",
  updatedAt: "2025-10-15T08:00:00Z"
}
```

## Design

I went with a minimal black and white design inspired by shadcn/ui. The theme toggle lets you switch between light and dark modes, with your preference saved to localStorage.

**Colors:**
- Light mode: White background, black text, light gray buttons
- Dark mode: Dark gray background, white text
- Accent: Red for errors/warnings
- Highlight: Yellow for search matches

**Typography:**
- Inter font for the app title
- System fonts for everything else
- Tight letter spacing on headings

## Accessibility

- Semantic HTML with proper landmarks
- All inputs have labels
- Keyboard navigation throughout
- ARIA live regions for status updates
- Focus indicators on all interactive elements
- Color contrast meets WCAG AA standards

## Responsive Breakpoints

- **Mobile (360px+):** Single column, stacked layout
- **Tablet (768px+):** 2-column grid, horizontal controls
- **Desktop (1024px+):** 4-column grid, expanded spacing

## Technologies Used

- HTML5
- CSS3
- JavaScript ES6+ 
- localStorage API
- Google Fonts

## Author

**Mfitumukiza Peter**
- GitHub: [@Peter-Mfitumukiza](https://github.com/Peter-Mfitumukiza)
- Email: p.mfitumuki1@alustudent.com
