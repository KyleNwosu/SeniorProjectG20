# RoboControl - Consumer Robotics Interface

A modern web application for controlling and managing consumer robotics devices. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard** - Overview of robot status, battery, connectivity, and direct control panel
- **Control** - Dedicated control interface for robot movement and actions
- **Tasks** - Build and manage robot tasks
- **Schedule** - Schedule automated robot actions

## Tech Stack

- **Build Tool**: Vite 5
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **yarn**

If you don't have Node.js installed, use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage versions:

```bash
# Install Node.js via nvm (recommended)
nvm install 18
nvm use 18
```

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/KyleNwosu/SeniorProjectG20.git
   cd SeniorProjectG20
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install all required packages listed in `package.json`.

## Development

### Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:8080** (or the URL shown in the terminal).

The dev server includes:
- ✅ Hot Module Replacement (HMR) - changes reflect instantly
- ✅ Fast refresh for React components
- ✅ TypeScript type checking
- ✅ Source maps for debugging

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Testing the Application

### Manual Testing Checklist

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open the app** in your browser at `http://localhost:8080`

3. **Test each tab**:
   - ✅ **Dashboard** - Check robot status card (battery, connectivity), test control panel buttons
   - ✅ **Control** - Verify robot status and control panel work side-by-side
   - ✅ **Tasks** - Test task builder form and interactions
   - ✅ **Schedule** - Test scheduler interface

4. **Test interactions**:
   - Click control buttons (arrows, play/pause, stop) - should show toast notifications
   - Navigate between tabs - should switch smoothly
   - Resize browser window - should be responsive

5. **Check browser console**:
   - Open DevTools (F12 or Cmd+Option+I)
   - Look for any errors or warnings
   - Should see no errors related to Lovable or missing dependencies

### Build Testing

Test that the production build works:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

The preview server will start (usually on port 4173). Open the URL shown to verify the production build works correctly.

### Code Quality

Run the linter to check for code issues:

```bash
npm run lint
```

Fix any warnings or errors before committing.

## Project Structure

```
├── index.html              # Entry HTML file
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui configuration
├── public/                 # Static assets
│   ├── robots.txt
│   └── placeholder.svg
└── src/
    ├── main.tsx            # Application entry point
    ├── App.tsx             # Root component with routing
    ├── index.css           # Global styles
    ├── pages/
    │   ├── Index.tsx       # Main page with tabs
    │   └── NotFound.tsx    # 404 page
    ├── components/
    │   ├── RobotStatus.tsx    # Robot status card
    │   ├── ControlPanel.tsx  # Control interface
    │   ├── TaskBuilder.tsx   # Task creation
    │   ├── Scheduler.tsx      # Schedule management
    │   └── ui/               # shadcn/ui components
    ├── hooks/               # Custom React hooks
    └── lib/                 # Utility functions
```

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@/*` → `./src/*`

Example:
```typescript
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, Vite will automatically try the next available port. You can also specify a different port:

```bash
npm run dev -- --port 3000
```

### Module Not Found Errors

If you see module resolution errors:

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

If TypeScript shows errors:

```bash
# Check TypeScript version matches package.json
npm list typescript

# Restart your IDE/editor to reload TypeScript server
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder with:
- Minified JavaScript and CSS
- Optimized assets
- Production-ready HTML

### Deploy Options

The `dist/` folder can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Use GitHub Actions or manual upload
- **AWS S3**: Upload `dist/` contents to an S3 bucket
- **Any web server**: Copy `dist/` contents to your server's public directory

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Run linter: `npm run lint`
5. Commit and push your changes

## License

[Add your license here]

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
