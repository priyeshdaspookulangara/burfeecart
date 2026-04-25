# Burfee Admin Mobile Application

Modern and innovative React Native application for Burfee Cart administration.

## Features

- **Dashboard**: Overview of members, business, commissions, and performance charts.
- **Recharge Management**: Manage eligible members, upcoming recharges, and overdue payments.
- **Alerts**: Urgency-based recharge tracking (Due Today, Next Hour, Just Now).
- **History**: Full audit trail of recharge records.
- **Authentication**: Secure admin login with token-based API access.

## Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Icons**: Lucide React Native
- **Charts**: React Native Chart Kit
- **Networking**: Axios with Interceptors

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo Go app on your mobile device (optional for testing)
- Android Studio / Xcode (for native development)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

- **Development Server**:
  ```bash
  npx expo start
  ```
  Scan the QR code with your Expo Go app or press `a` for Android / `i` for iOS.

- **Web Version**:
  ```bash
  npm run web
  ```

### Configuration for Android Studio

If you want to open the project in Android Studio, you need to generate the native `android` folder first:

1. Run the prebuild command:
   ```bash
   npx expo prebuild --platform android
   ```
2. Once the `android` folder is generated, open that folder in Android Studio.

## API Reference

The app interacts with the Burfee Cart Admin API at: `https://burfeecart.com/admin/admin-api.php`

All endpoints (except login) require the `X-Admin-Token` header.
