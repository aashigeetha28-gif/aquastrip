import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../services/mockData';

interface AuthContextType {
  currentUser: User;
  isLoggedIn: boolean;
  loginAs: (user: User) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Field Worker (Volunteer) for testing the mobile flow
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const loginAs = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const switchRole = (role: UserRole) => {
    const userForRole = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    setCurrentUser(userForRole);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        loginAs,
        switchRole,
        logout,
        allUsers: MOCK_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
