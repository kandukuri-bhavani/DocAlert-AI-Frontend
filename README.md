# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
## Project Repositories

DocAlert AI is developed using a separate frontend and backend.

- **Frontend:** React.js, Vite, JavaScript and CSS  
  Repository: https://github.com/kandukuri-bhavani/DocAlert-AI-Frontend

- **Backend:** Java, Spring Boot and Maven  
  Repository: https://github.com/kandukuri-bhavani/DocAlert-AI-Backend

### Architecture

The frontend provides the user interface for document management, document previews, and reminders. The Spring Boot backend provides REST APIs for authentication, document operations, and reminder-related functionality.

The frontend communicates with the backend through HTTP requests. Both repositories are maintained separately.

### Development

- Frontend development: VS Code
- Backend development: Spring Tools for Eclipse
- Backend build tool: Maven
