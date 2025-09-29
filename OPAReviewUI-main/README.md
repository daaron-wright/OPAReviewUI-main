# Business-Technical Feedback Loop

Interactive state machine visualization and policy management system with real-time OPA dashboard.

## Overview

A Next.js application that renders complex state machines as interactive graphs, allowing users to review business requirements alongside technical Rego policies, test them, and publish to production with an epic celebration.

## Key Features

- **Interactive State Machine Graph** - Visualize and navigate complex state transitions
- **Dual-Panel Modal** - Business requirements (Arabic/English) alongside technical Rego rules
- **Policy Testing** - Run test cases with pass/fail validation
- **AI Chat Integration** - Rework policies with mock LLM assistance
- **Walkthrough Mode** - Guided review process with visual indicators
- **Epic Celebrations** - Mario & Luigi animations with confetti on successful publish
- **OPA Dashboard** - Real-time policy enforcement monitoring

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **ReactFlow** - Interactive node-based graph visualization
- **Dagre** - Automatic graph layout algorithm
- **Tailwind CSS** - Utility-first styling
- **React Toastify** - Elegant notifications
- **Canvas Confetti** - Celebration animations

## Architecture

```
src/
├── domain/          # Pure business logic and types
├── adapters/        # External integrations and data providers
├── components/      # UI components and user interactions
├── context/         # Global state management
└── app/            # Next.js pages and routing
```

## Getting Started

```bash
yarn install
yarn dev
```

Navigate to `http://localhost:3000` to start reviewing state machines.

## Usage

1. **Review Nodes** - Click nodes to view business requirements and technical policies
2. **Test Policies** - Run Rego test cases and validate results
3. **Walkthrough Mode** - Use guided review for systematic validation
4. **Publish** - Deploy all approved policies with celebration
5. **Dashboard** - Monitor live OPA server metrics at `/dashboard`
