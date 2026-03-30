import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";
import { getErrorMessage } from "@/helpers/error";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        try {
          const { data: res } = await api.login({
            email,
            password,
          });

          const { user, access_token, refresh_token } = res.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          set({ user, isAuthenticated: true, error: null });
          return { success: true, user };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      register: async ({ name, email, password }) => {
        try {
          const { data: res } = await api.register({
            name,
            email,
            password,
          });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      loginWithGoogle: async (accessToken, intent = "login") => {
        try {
          const { data: res } = await api.google({
            access_token: accessToken,
            intent,
          });

          const { user, access_token, refresh_token } = res.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          set({ user, isAuthenticated: true, error: null });
          return { success: true, user, isNewUser: res.data.is_new_user };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
          // Tetap logout meski request gagal
        } finally {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      forgotPassword: async (email) => {
        try {
          const { data: res } = await api.forgotPassword({ email });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      resendVerification: async (email) => {
        try {
          const { data: res } = await api.resendVerification({ email });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      resetPassword: async (token, password) => {
        try {
          const { data: res } = await api.resetPassword({ token, password });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      verifyEmail: async (token) => {
        try {
          const { data: res } = await api.verifyEmail(token);
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      changePassword: async (data) => {
        try {
          const { data: res } = await api.changePassword(data);
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      fetchMe: async () => {
        try {
          const { data: res } = await api.me();
          set({ user: res.data, isAuthenticated: true });
        } catch {
          // Token invalid → jangan update state
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
