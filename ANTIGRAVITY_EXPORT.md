# HydroFlow Logic Components Export for Antigravity IDE

This document outlines the architecture, database requirements, and logic components for the HydroFlow IoT management system.

## 1. Database Requirements

The system requires a persistent store for the following entities, structured as defined in the application state:

### Entities
- **SystemStatus**: `{ status: string, color: string }`
- **Pump**: `{ id: string, name: string, status: 'on' | 'off', flowRate: number }`
- **User**: `{ name: string, role: 'admin' | 'view_only', initials: string, title: string }`
- **AutomationRule**: `{ id: number, sourceId: number, targets: { id: number, action: string }[], condition: string, status: 'Active' | 'Paused' }`

## 2. Logic Components

### Hardware Components
- **Pump**: Controllable hardware component.
- **Valve**: Controllable hardware component.
- **Soil Sensor**: Data source component.
- **Dual IR Sensor**: Data source component (e.g., for tank levels).

### Automation Rules
- **Structure**: `AutomationRule`
- **Parameters**:
  - `sourceId`: ID of the sensor component triggering the rule.
  - `condition`: String-based condition (e.g., "Value < 40%").
  - `targets`: Array of objects containing `id` (target hardware component) and `action` (e.g., "Turn On").
  - `status`: 'Active' | 'Paused'.

## 3. Logic Connections

Logic flows are established via the `AutomationRule` entity:

1.  **Trigger**: A data source component (e.g., Soil Sensor) provides a value.
2.  **Evaluation**: The `condition` defined in the `AutomationRule` is evaluated against the sensor value.
3.  **Action**: If the condition is met, the system executes the `action` defined for each `target` component (e.g., Pump, Valve).

## 4. Implementation Notes
- The system uses a centralized `AppContext` for managing the state of these components.
- Hardware components are identified by their `id` and `type`.
- Automation rules are linked to hardware components via `sourceId` (trigger) and `targets` (actuators).
