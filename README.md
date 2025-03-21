# AutoTag

is AI-powered media content management system

## Overview

With exponentially growing amount of audio and video content, managing manually and tagging media has become a real challenge. This project's goal to enhance SpeedAdmin, a platform for music education, by integrating AI-powered content management system. Solution is to automatically generate tags and summaries for audio and video files, increasing easier seacrhability, work or study organisation, and overall user experience.

## Features

- AutoTag generation: AI-powered tagging system for convenient organisation of a content;
- Voice-to-Text conversion: transcribes spoken content into text for comfortable seachability;
- Smart search: search based on tags, summaries and metadata;
- Admin dashborad: user and content management panel;
- Secure architecture: privacy, scalability and maintainability ensurance.

## Technologies used in AutoTag

- Frontend: Angular framework (User Interface and interactions);
- Backend: Node.js & Express.js (APIs & server logic);
- Database: PostgreSQL (Metadata, tags, summaries storage);
- AI Processing: Python (Implementation of Tag generation, Voice-to-Text, summarisation);
- Cloud storage;
- Version Control: Github.

## System components

- Frontend: Uploader (Upload and manage media files), Content Search (Advanced filtering based on tags & summaries), and Admin dashboard;
- Backend: Video processor (Metadata extraction & media processing);
- Backend - Python: AI services such as Voice-to-Text, Tag generation & Content summarisation;
- Database;
- Cloud storage.

## Running the project

### Prerequisites

- **Docker:** Install [Docker](https://www.docker.com/get-started) on your local machine
- **Node.js and npm:** Ensure [Node.js](https://nodejs.org/) is installed
- **Angular CLI:** Install the Angular CLI globally using: npm install -g @angular/cli in the terminal

### Clone the repository

```bash
git clone https://github.com/sduhubert/AutoTag
cd AutoTag
```

### Install dependencies

- Use `npm install` in both: Frontend and Backend folders
- Use `pip install` in Python folder

### Set up the environment

- Create .env file and copy example.env in there (Backend folder)
- Fill the required values

### Run the application using Docker

```bash
docker-compose up --build
```

### Stop the application

```bash
docker-compose down
```

### Running tests

```bash
  ng test
```

## Accessing the application

- **Frontend (Angular):** [http://localhost:4200/](http://localhost:4200/)
- **Backend (Express):** [http://localhost:3000/](http://localhost:3000/)
- **Database (PostgreSQL):** Port 5432
- **AI Module:** Port 8001

### To log in, use the following credentials

To log in, use the following credentials:

| Role       | Username/email | Password      |
|------------|----------------|---------------|
| **User**   | user1          | password1     |
| **Admin**  | admin          | admin1        |

## Development approach

Followed by Agile Scrum methodology:

- Weekly sprints: for continious progress;
- Sprint and retrospectives: plan and improvement of the workflow;
- Task tracking via Jira & Github: for work organisation.

## Project Timeline

- **Setup & MVP development (Weeks 1-4)**

Basic UI, backend API, database and AI integration

- **Core feature implementation (Weeks 5-8)**

Implemented AI tagging & summarisation, content search, ready dashboard

- **Optimisation & Final testing (Weeks 9-12)**

Perfomance improvements, bugs elimination, secutiry, and final refinements

## Authors and their primary roles

- [Alina Kristell](https://github.com/alikrist) is Group leader
- [Hubert Sylwesiuk](https://github.com/sduhubert) is Technical leader
- [Jakub Smilowski](https://github.com/JakubSmilowski) is Scrum master
- [Sandra Gallmayer](http://github.com/Condesgall) is Data scientist
- [Dominik Bosy](https://github.com/Dobos23) is Product owner
- [Mónica López](https://github.com/monica1306) is Report leader
