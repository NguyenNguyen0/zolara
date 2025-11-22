import { createContext } from 'react';
import type { AuthContextType } from './AuthContext.types';

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
