# Scrum Poker Planning

[![Build & Tests](https://github.com/IssamElNass/scrum-poker-planning/actions/workflows/ci.yml/badge.svg)](https://github.com/IssamElNass/scrum-poker-planning/actions/workflows/ci.yml)

A modern, open-source online planning poker tool designed to revolutionize how Scrum teams conduct estimation sessions. Built with a whiteboard-style canvas interface that makes planning poker intuitive, engaging, and collaborative for teams worldwide!

> **Note**: This project was originally forked from [@INQTR/poker-planning](https://github.com/INQTR/poker-planning). Due to inactivity from the original maintainer, I decided to host and continue development with exciting new features and improvements!

## Features 🚀

### Core Features

- **🆓 Free forever** - No registration required, and we're committed to keeping it free forever as long as we can pay for it! :)
- **⚡ Real-time collaboration** - Lightning-fast synchronization with instant updates for all participants
- **🎨 Interactive canvas interface** - Modern whiteboard-style room with drag-and-drop functionality
- **👥 Unlimited team size** - Invite as many team members as you need with no restrictions
- **📊 Advanced vote analysis** - Comprehensive statistics, agreement analysis, and outlier detection
- **🔄 Multiple voting systems** - Fibonacci, Modified Fibonacci, T-shirt sizes, and Powers of 2
- **🌙 Dark mode support** - Beautiful interface that works in any lighting condition
- **📱 Mobile responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **🧹 Auto-cleanup** - Rooms are automatically cleaned up after 8 days of inactivity

### Advanced Features

- **📈 Vote distribution charts** - Visual representation of team estimates
- **🎯 Agreement quality metrics** - Understand team consensus levels
- **👤 Observer role support** - Allow stakeholders to watch without voting
- **🔗 Easy room sharing** - One-click room URL copying and QR codes
- **⏱️ Smart timer** (Coming Soon) - Built-in timer to keep estimation sessions focused
- **📤 Session export** (Coming Soon) - Export results for documentation

## Technology Stack 🛠️

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Convex (serverless TypeScript functions with real-time reactivity)
- **Styling**: Tailwind CSS 4, shadcn/ui components, Lucide React icons
- **Canvas**: @xyflow/react for interactive whiteboard functionality
- **State Management**: Convex reactive queries with React Context for authentication
- **UI Components**: Radix UI primitives for accessibility
- **Testing**: Playwright for end-to-end testing
- **Code Quality**: ESLint, TypeScript strict mode
- **Build**: Turbopack for faster development builds

## Getting Started 🏁

### Prerequisites

- **Git** - Version control
- **Node.js 20+** and **npm** - JavaScript runtime and package manager
- **Convex account** - Free tier available at [convex.dev](https://convex.dev)

### Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/IssamElNass/scrum-poker-planning.git
   cd scrum-poker-planning
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up Convex backend:**

   ```sh
   npx convex dev
   ```

   This will:

   - Prompt you to log in to Convex (or create a free account)
   - Create a new Convex project
   - Set up your development environment
   - Generate the necessary configuration files

### Running the Application

1. **Start the Convex backend** (in one terminal):

   ```sh
   npx convex dev
   ```

2. **Start the Next.js development server** (in another terminal):

   ```sh
   npm run dev
   ```

   > **Note**: We use Turbopack for faster development builds!

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

4. **Create a room** and start planning! 🚀

## Testing 🧪

This project uses **Playwright** for comprehensive end-to-end testing to ensure reliability across different browsers and user scenarios.

### Available Test Commands

```sh
# Run all tests (default)
npm run test:e2e

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests in headless mode (CI/CD)
npm run test:e2e:headless

# Code quality checks
npm run lint           # ESLint
npm run lint:fix       # Auto-fix linting issues
npm run ts:check       # TypeScript type checking
```

### Test Coverage

Our test suite covers:

- 🏠 **Homepage functionality** - Room creation, navigation
- 🎯 **Room operations** - Joining, voting, revealing cards
- 👥 **User interactions** - Multiple users, real-time updates
- ⏱️ **Timer functionality** - Session timing features
- 🔧 **Room settings** - Configuration and member management

## Deployment 🚀

The application is designed for easy deployment with a modern serverless architecture.

### Production Deployment

#### Frontend (Next.js)

Deploy to your preferred platform:

- **Recommended**: [Vercel](https://vercel.com) (optimized for Next.js)
- **Alternative**: Netlify, Railway, or any platform supporting Next.js

#### Backend (Convex)

1. **Deploy Convex functions:**

   ```sh
   npx convex deploy --prod
   ```

2. **Update your frontend environment** to point to the production Convex deployment

### Environment Setup

- **Development**: Uses local Convex development environment
- **Production**: Requires Convex production deployment
- **Environment Variables**: Automatically managed by Convex CLI

### Docker Support

Alternatively, use the included Docker configuration:

```sh
# Build and run with Docker Compose
docker-compose up --build
```

See `docker-compose.yml` and `Dockerfile` for container configuration.

## Contributing 🤝

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and ensure tests pass
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all linting and type checks pass
- Test your changes thoroughly

### Areas for Contribution

- 🐛 **Bug fixes** - Help us squash those pesky bugs
- ✨ **New features** - Enhance the planning poker experience
- 📚 **Documentation** - Improve guides and examples
- 🧪 **Testing** - Expand test coverage
- 🎨 **UI/UX** - Make the interface even more intuitive
- 🌍 **Accessibility** - Help make the app usable for everyone

## Project Details 📋

- **Author**: [Issam El Nass](https://github.com/IssamElNass)
- **Repository**: [scrum-poker-planning](https://github.com/IssamElNass/scrum-poker-planning)
- **License**: [MIT License](LICENSE) - see LICENSE file for details

## Support & Community 💬

- 🐛 **Found a bug?** [Open an issue](https://github.com/IssamElNass/scrum-poker-planning/issues)
- 💡 **Have a feature idea?** [Start a discussion](https://github.com/IssamElNass/scrum-poker-planning/discussions)
- ⭐ **Like the project?** Give it a star on GitHub!

---

**Made with ❤️ for Scrum teams everywhere**
