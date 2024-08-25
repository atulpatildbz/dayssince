# Days Since App

## Overview

Days Since is a simple, user-friendly web application designed to help users track and manage important dates and events. Built with React and TypeScript, this app allows users to add, view, and manage events, calculating the number of days since each event occurred.

## Features

- **Add Events**: Users can add new events with a name and date.
- **View Events**: All added events are displayed in a clean, card-based layout.
- **Days Calculation**: The app automatically calculates and displays the number of days since each event.
- **Anniversary Tracking**: Option to show days until the next anniversary of an event.
- **Due Date Tracking**: Ability to set and display the next due date for recurring events.
- **Search Functionality**: Users can search through their events easily.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.
- **Detailed Duration**: Option to view duration in years, months, and days format.
- **Responsive Design**: Works well on both desktop and mobile devices.

## Technical Details

- Built with React and TypeScript
- Uses local storage for data persistence
- Implements responsive design with Tailwind CSS
- Utilizes Lucide React for icons

## How to Use

1. **Adding an Event**: Click the '+' icon to open the add event modal. Fill in the event details and click 'Add Event'.
2. **Viewing Events**: All your events are displayed on the main screen.
3. **Searching Events**: Use the search bar at the top to filter events.
4. **Resetting an Event**: Click the refresh icon on an event card to reset its date to today.
5. **Removing an Event**: Click the 'X' icon on an event card to delete it.
6. **Toggling Dark Mode**: Use the sun/moon icon to switch between light and dark modes.
7. **Changing Duration Format**: Click the calendar icon to toggle between simple and detailed duration formats.

## Installation and Setup

1. Clone the repository
2. Run `bun install` to install dependencies
3. Use `bun run dev` to start the development server
4. For production, use `bun run build` to create a production build

Enjoy tracking your important dates with Days Since!
