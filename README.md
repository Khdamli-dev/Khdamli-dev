# Khdamli

## Overview

Khdamli is a mobile application we developed to connect clients with skilled workers in Algeria, addressing the challenges of slow, unreliable hiring processes. Our app enables clients to post job requests (public or private) and workers to browse or accept jobs, fostering local employment and community growth. Built as a second-year project at ESI SBA by a team of six students, Khdamli simplifies job matching through an intuitive platform.

### Key Features
- **Client Functions**: Sign up, post public/private job requests with photos, browse categories (e.g., plumbing), comment on worker responses, rate workers (5 stars), and receive notifications.
- **Worker Functions**: Sign up with skills, browse job categories, comment on or accept jobs, edit/delete comments and view client ratings.
- **Local Matching**: Prioritizes jobs in the user’s city for efficiency.
- **Public/Private Requests**: Clients can post jobs for all workers (public) or one worker (private).

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- React Native CLI
- Android Studio or a mobile phone (This app was not tested on iPhone, so we have no idea if it works there or no)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Khdamli-dev/Khdamli-dev.git
   cd Back-End
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the PostgreSQL database: (we used Supabase, but you can just run it locally with psql client)
   - Create a database named `khdamli`. (or whatever you want, who cares, just be sure to create the proper schema [here](Back-End/database/dbSchema.sql)
   - Update `/Back-End/database/dbConnection.ts` with your database credentials (host, user, password, database).

4. Start the server:
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:${port}` by default.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Front-End
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the backend API URL in `Front-End/src/config.ts` (e.g., `http://localhost:3000`).
4. Run the app:
   ```bash
   npx expo start
   ```
   _(include the `--tunnel` option in case it doesn't start)_

## Usage

1. **Sign Up**: Create a client or worker account with name, email, password, city, and (for workers) skills.
2. **Clients**:
   - Post a job (public for all workers or private to one) with details and photos.
   - Browse worker comments on public jobs or select a worker for private jobs.
3. **Workers**:
   - Browse public jobs matching your skills or accept private requests.
   - Comment on public jobs (edit/delete as needed).
4. Navigate jobs by category (e.g., carpentry) and location.

## Team

Khdamli was developed by a team of six ESI SBA students:
   - [Bouaabdellah](https://github.com/Bouaabdellah)
   - [Mossablt](https://github.com/Mossablt)
   - [mohammedseghiralaa](https://github.com/mohammedseghiralaa)
   - [filasouf2005](https://github.com/filasouf2005)
   - [KHALIL-hub5](https://github.com/KHALIL-hub5)
   - [Mino046](https://github.com/Mino046) or [faraday002](https://github.com/faraday002) (both are the same person)
if you run into any problem with setting the project, contact any person that has put his contact info in his github account from the team above

## Future Plans

We aim to enhance Khdamli by:
- Adding in-app messaging for direct client-worker communication.
- Expanding job categories to cover more services.
- Improving accessibility with additional language support.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
