// File: src/frontend/src/context/AppContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';

export type UserRole = 'admin' | 'view_only';

export type User = {
  name: string;
  role: UserRole;
  initials: string;
  title: string;
};

type Pump = {
  id: string;
  name: string;
  status: 'on' | 'off';
  flowRate: number;
};

type SystemStatus = {
  status: string;
  color: string;
};

export type AutomationRule = {
  id: number;
  sourceId: number;
  targets: { id: number; action: string }[];
  condition: string;
  status: 'Active' | 'Paused';
};

type AppState = {
  systemStatus: SystemStatus | null;
  pumps: Pump[];
  currentUser: User | null;
  automations: AutomationRule[];
};

type Action =
  | { type: 'SET_SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'SET_PUMPS'; payload: Pump[] }
  | { type: 'UPDATE_PUMP'; payload: Pump }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTOMATIONS'; payload: AutomationRule[] }
  | { type: 'ADD_AUTOMATION'; payload: AutomationRule }
  | { type: 'UPDATE_AUTOMATION'; payload: AutomationRule }
  | { type: 'DELETE_AUTOMATION'; payload: number };

const initialAutomations: AutomationRule[] = [
  { 
    id: 1, 
    sourceId: 3, 
    targets: [
      { id: 1, action: 'Turn On' },
      { id: 5, action: 'Turn On' },
      { id: 2, action: 'Turn On' },
      { id: 6, action: 'Turn On' }
    ], 
    condition: 'Value < 40%', 
    status: 'Active' 
  },
  { 
    id: 2, 
    sourceId: 4, 
    targets: [{ id: 1, action: 'Turn Off' }], 
    condition: 'Level < 10%', 
    status: 'Active' 
  },
  { 
    id: 3, 
    sourceId: 3, 
    targets: [{ id: 2, action: 'Turn Off' }], 
    condition: 'Value > 70%', 
    status: 'Paused' 
  },
];

const initialState: AppState = {
  systemStatus: null,
  pumps: [],
  currentUser: null,
  automations: initialAutomations,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SYSTEM_STATUS':
      return { ...state, systemStatus: action.payload };
    case 'SET_PUMPS':
      return { ...state, pumps: action.payload };
    case 'UPDATE_PUMP':
      return {
        ...state,
        pumps: state.pumps.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_AUTOMATIONS':
      return { ...state, automations: action.payload };
    case 'ADD_AUTOMATION':
      return { ...state, automations: [...state.automations, action.payload] };
    case 'UPDATE_AUTOMATION':
      return {
        ...state,
        automations: state.automations.map((a) => (a.id === action.payload.id ? action.payload : a)),
      };
    case 'DELETE_AUTOMATION':
      return {
        ...state,
        automations: state.automations.filter((a) => a.id !== action.payload),
      };
    default:
      return state;
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
