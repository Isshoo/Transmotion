"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import OfflineBanner from "@/components/common/OfflineBanner";
import { Toaster } from "sonner";

export default function Providers({ children }) {
  return (
    <>
      <OfflineBanner />
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        {children}
      </GoogleOAuthProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}
