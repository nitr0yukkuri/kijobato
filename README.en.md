# Kijobato

[日本語](README.md) | [English](README.en.md)

A game where you and a CPU opponent enter terms about basic information technology until neither of you can think of more.

## Overview

This project aims to help players learn basic IT knowledge while having fun, through a CPU opponent (the game frontend). Data is served by a Node.js (Express) server intended for deployment on Vercel.

## Run locally

1. Clone the repository.
   ```sh
   git clone https://github.com/nitr0yukkuri/kijobato.git
   cd kijobato
   ```
2. Install dependencies.
   ```sh
   npm install
   ```
3. Start the local server.
   ```sh
   node api/server.js
   ```
4. The server starts at `http://localhost:3001` (or the port specified in `server.js`).
5. Open `front/taitoru/index.html` or another frontend page in a browser to start the game.

## API endpoints

The server provides JSON data from these endpoints:

- `/api/database`: list of database-related terms
- `/api/kisorironn`: list of fundamental-theory terms
- `/api/network`: list of networking terms
- `/api/algorithm`: list of algorithm terms
- `/api/computer-component`: list of computer-component terms
- `/api/operation-system`: list of operating-system terms
- `/api/system-components`: list of system-component terms
