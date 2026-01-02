"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
	user: any;
	login: (email: string, password: string) => Promise<boolean>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<any>(null);

	const login = async (email: string, password: string): Promise<boolean> => {
		// Mock login
		console.log("Mock login for:", email);
		setUser({ email, name: "Test User", role: "admin" });
		return true;
	};

	const logout = () => {
		setUser(null);
	};

	const value = {
		user,
		login,
		logout,
		isAuthenticated: !!user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		// Return mock auth for build time
		return {
			user: null,
			login: async () => true,
			logout: () => {},
			isAuthenticated: false,
		};
	}
	return context;
}
