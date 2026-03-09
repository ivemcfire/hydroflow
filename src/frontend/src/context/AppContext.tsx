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

type AppState = {
  systemStatus: SystemStatus | null;
  pumps: Pump[];
  currentUser: User | null;
};

type Action =
  | { type: 'SET_SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'SET_PUMPS'; payload: Pump[] }
  | { type: 'UPDATE_PUMP'; payload: Pump }
  | { type: 'SET_USER'; payload: User | null };

const initialState: AppState = {
  systemStatus: null,
  pumps: [],
  currentUser: null,
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
