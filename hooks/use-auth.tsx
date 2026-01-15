"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api-client';
import { User, Role } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    role: Role;
    token: string | null;
    isLoading: boolean;
    login: (credentials: { username: string; password: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: { username: string; password: string }) => {
        setIsLoading(true);
        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);

            // 🔍 DEBUG: Log what we're sending
            console.log('=== LOGIN DEBUG START ===');
            console.log('1. Username:', credentials.username);
            console.log('2. Password length:', credentials.password.length);
            console.log('3. FormData:', formData.toString());
            console.log('4. Endpoint:', '/auth/login/unified');

            const data = await fetchApi("/auth/login/unified", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            console.log('5. ✅ Login successful! Token received');
            console.log('6. Token preview:', data.access_token?.substring(0, 20) + '...');
            console.log('7. User data from login:', { role: data.role, nom: data.nom, prenom: data.prenom });

            setToken(data.access_token);
            localStorage.setItem("token", data.access_token);

            // Fetch full profile to get the ID and other details
            console.log('8. Fetching user profile from /auth/me...');
            const profile = await fetchApi("/auth/me", {
                headers: { "Authorization": `Bearer ${data.access_token}` }
            });

            console.log('9. ✅ Profile fetched successfully:', profile);

            const userObj: User = {
                id: profile.id,
                email: profile.email || "",
                nom: profile.nom,
                prenom: profile.prenom,
                role: profile.role as Role,
                login: profile.login
            };

            console.log('10. ✅ User object created:', userObj);

            setUser(userObj);
            localStorage.setItem("user", JSON.stringify(userObj));

            console.log('=== LOGIN DEBUG END - SUCCESS ===');
        } catch (error) {
            console.error('❌ LOGIN ERROR:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            console.log('=== LOGIN DEBUG END - FAILED ===');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const value = {
        user,
        role: user?.role || 'guest',
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
