# IMPLEMENTATION.md

## Tech Stack
The application is built using the following technologies:
- **Next.js**: Utilized for both frontend and backend development, providing a seamless server-side rendering experience and efficient routing.
- **Supabase**: Chosen as the database (Postgre).
- **Shadcn**: Employed for UI components, enhancing the user interface with a modern design.

## How to Run the Application
To run the application locally, follow these steps:
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env.local` file and adding the required Supabase credentials.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Assumptions and Design Decisions
- The choice of Supabase as a backend was influenced by its ease of use and real-time capabilities, which are essential for a dynamic Todo List application.

## Features Implemented
The application includes the following features for effective Todo management:
1. **Todo Management**
   - Create new todos with titles and descriptions.
   - Add tags and set priorities (High, Medium, Low) for todos.
   - Edit existing todos to update their details.
   - Delete todos when they are no longer needed.

2. **Todo Details**
   - Users can click on a todo to view its detailed information, including tags, priority, notes, and assigned users.

3. **List View Features**
   - Display all todos with essential information in a user-friendly list format.
   - Implement pagination for efficient navigation (either through infinite scroll or numbered pagination).
   - Filter todos based on tags, priority, or assigned users.
   - Sort todos by creation date, priority, and other relevant criteria.

4. **Data Export**
   - Provide functionality to export all todos of a user in either JSON or CSV format for external use.

## Additional Features and Improvements
- A modal has been implemented to allow users to add notes to a todo by clicking an icon next to the todo.
- Sorting and filtering capabilities have been enhanced to include priority, improving the overall usability of the application.

## Future Enhancements
- Explore the possibility of integrating notifications for upcoming deadlines or reminders related to todos.
