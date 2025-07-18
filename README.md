Frontend and backend for Handy MVP
This guide provides a detailed setup for the Handyman app, a full-stack marketplace application connecting customers with local service providers, built with React Native(Expo) for the front end, Node.js for the backend, and PostGis for GeoSpatial search.  

Setup Instructions:
The handyman app requires setting up both the backend(Node.js with Express) and frontend (React Native with Expo), along with a PostgresSQL database with PostGis for GeoSpatial functionality.
Below are step-bystep instructions to set up the app locally for development

Step 1: Clone the repository
    Action: Clone the project repository from GitHub.
    git clone https://github.com/gbochi255/handy-app-1

Navigate: Enter the project directory.
    (on terminal/bash)
    cd handy-app-1
The repository have a structure with separate directories for backend (/backend) and frontend(/frontend).

Step 2: Set up the Back End
The back end uses Node.js, Express, PostGis, Socket.io for real-time chat, and Jest/Supertest for testing.
    1. Navigate to Back End Directory
    (on terminal/bash)
    cd backend

    2. Install Dependencies
    Install required packages
    (on terminal/bash)
    npm install
    This installs dependencies like Express, Socket.io, Axios, jest and Supertest

    3. Configure Environment Variables
    Create a .env file in the /backend directory with database connection details:

    DBUSER=youruser
    DBPASSWORD=yourpassword
    DBHOST=localhost
    DBPORT=5432
    DBNAME=handyman

    These variables aer used to connect to a local PostgreSQL database with PostGis enabled.

    4. Start the Back End
        Run the server:
        npm start
    This typically executes node server.js, starting the server on a port (eg 8080). Ensure no errors occur, such as the path-to-regexp issue which may require correct route definations.

Step 3: Set up the PostgreSQL Database with PostGis
The app uses PostGis for GeoSpatial search, requiring a PostgreSQL database with the PostGis extension.
    1. Install PostgreSQl and PostGis
        in terminal (after installing homebrew)
         brew install postgresql
         brew install postgis

    2. Create a Databse
        create new database named handyman:

        (in terminal)
        createDb -U youruser handyman

    3.Enable PostGis Extension
        connect to the databse and enable PostGis
        psql -U youruser -d handyman -c "CREATE EXTENSION postgis;"

        This enables geospatial data types and functions such as ST_DWithin for location-based queries
    
    4. Set Up Database Schema
        psql -U youruser -d -f schema.sql

Step 4: Set up The Front End

The front end is a React Native mobile app built with expo.
    1. Navigate to frontend Directory

    cd frontend

    2. Install dependencies
        install required packages

        using 
        npm install

        This includes React Native, Expo, Axios and other dependencies for mobile UI.
    
    3. configure Environment Varables
        Creat .env file in the front end directory

        BACKEND_URL=http://localhost:3000
        SUPABASE_URL=your_supabase_url
        SUPABASE_KEY=your_supabase_key

        BACKEND_URL points to the local back end server.
        SUPABASE_URL and SUPABASE_KEY are used for accessing Supabase storage for assets(eg images).
    
    4. Start Front End
        run the expo development server
        (terminal)
        expo start

        This opens the Expo developer tools. Use the expo Go app on your mobile device or an emulator to view app.
Step 5:
    The app uses Socket.io for real-time chat. Ensure the backend is running, as the front end connects to the backend's Socket.io server for chat functionality

    Test chat by opening the app on two devices/emulators and sending messages.

Step 6: Run test
    Back end Tests: Run unit and end-to-end tests using Jest and Supertest:

    npm test

    Front End Test: Run unit tests(if available) using Jest.
    npm test

    Tests ensure reliability, covering API endpoints, geospatial queries and UI components.