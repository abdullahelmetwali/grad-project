# 5G Planning Tools - React Conversion

This project is a conversion of two Python Tkinter applications into a single React application using TypeScript and Tailwind CSS.

## Tools Included:

1.  **5G Dimension Tool (Capacity):** Calculates T-Cell, T-Site, Active Users, Per-Service Traffic, Total Traffic, and Number of Sites based on capacity parameters.
2.  **5G Network Planning Tool (Link Budget):** Calculates path loss through a series of questions, and then determines the number of sites based on link budget parameters.

## Project Structure

-   `/public`: Static assets and `index.html`.
-   `/src`: Main application source code.
    -   `/components`: Reusable React components.
        -   `/CapacityTool`: Components specific to the Capacity Tool.
    -   `/hooks`: Custom React hooks (if any).
    -   `/pages`: Top-level page components for each tool and the main app navigation.
        -   `CapacityToolPage.tsx`: Manages state and workflow for the Capacity tool.
        -   `LinkBudgetToolPage.tsx`: Manages state and workflow for the Link Budget tool.
        -   `linkBudgetData.ts`: Contains the question data for the Link Budget tool.
    -   `/types`: TypeScript interfaces and type definitions.
        -   `capacityTool.ts`: Types for the Capacity Tool.
        -   `linkBudgetTool.ts`: Types for the Link Budget Tool.
    -   `App.tsx`: Main application component, handles navigation between tools.
    -   `index.css`: Main CSS file, includes Tailwind CSS directives.
    -   `index.tsx`: Entry point of the React application.
-   `tailwind.config.js`: Tailwind CSS configuration.
-   `postcss.config.js`: PostCSS configuration.
-   `tsconfig.json`: TypeScript configuration.
-   `package.json`: Project dependencies and scripts.

## Running the Application

1.  **Prerequisites:**
    *   Node.js (which includes npm) installed on your system.

2.  **Installation:**
    *   Navigate to the project root directory (`5g_planning_tools_react`) in your terminal.
    *   Run the command: `npm install` (or `yarn install` if you prefer yarn).
      This will install all the necessary project dependencies.

3.  **Starting the Development Server:**
    *   After installation is complete, run the command: `npm start` (or `yarn start`).
    *   This will start the development server (usually on `http://localhost:3000`).
    *   The application should automatically open in your default web browser.

4.  **Building for Production:**
    *   To create an optimized production build, run: `npm run build` (or `yarn build`).
    *   The build artifacts will be stored in the `build/` directory.

## Notes

-   The application uses Tailwind CSS v3 for styling, as v4 had compatibility issues with the Create React App environment during development.
-   The calculation logic from the original Python scripts has been replicated in TypeScript within the respective page components (`CapacityToolPage.tsx` and `LinkBudgetToolPage.tsx`).
-   Error handling for invalid numerical inputs is included in the forms.

