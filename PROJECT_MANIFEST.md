# HydroFlow Project Manifest

## Overview
HydroFlow is a modular, scalable IoT application for managing water pumps and monitoring flow rates.

## Architecture
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **State Management**: React Context API
- **Deployment**: Blue-Green Ready (reads `APP_COLOR` from environment)

## Directory Structure
- `src/frontend/`: React application
- `src/backend/`: Node.js API
- `src/firmware/`: ESP32 C++ code (placeholder)
- `infra/`: Kubernetes and Docker configurations (placeholder)

## Current Status
- Basic skeleton implemented with mock data.
- System Status banner reads `APP_COLOR` to indicate Blue/Green environment.
- Pump control UI implemented with Context API state management.
