
import { create } from 'zustand';
import { axiosInstance } from '../components/lib/axios';

export const userAuthStore = create((set) => ({
    authUser: null,
    isSigningIn: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check")
            
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });  
        } finally {
            set({ isCheckingAuth: false });
        }
    }

}))