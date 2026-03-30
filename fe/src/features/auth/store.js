import { create } from "zustand";
import { persist } from "zustand/middleware";
import authApi from "./api";
import { getErrorMessage } from "@/helpers/error";
import { redirect } from "next/navigation";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        try {
          const { data: res } = await authApi.login({
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
          const { data: res } = await authApi.register({
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
          const { data: res } = await authApi.google({
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
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, isAuthenticated: false, error: null });

        redirect("/login");
      },

      forgotPassword: async (email) => {
        try {
          const { data: res } = await authApi.forgotPassword({ email });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      resendVerification: async (email) => {
        try {
          const { data: res } = await authApi.resendVerification({ email });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      resetPassword: async (token, password) => {
        try {
          const { data: res } = await authApi.resetPassword({
            token,
            password,
          });
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      verifyEmail: async (token) => {
        try {
          const { data: res } = await authApi.verifyEmail(token);
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      changePassword: async (data) => {
        try {
          const { data: res } = await authApi.changePassword(data);
          return { success: true, message: res.message };
        } catch (error) {
          return { success: false, message: getErrorMessage(error) };
        }
      },

      fetchMe: async () => {
        try {
          const { data: res } = await authApi.me();
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
