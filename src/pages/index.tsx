import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

export default function Home() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    if (sessionData) {
      void router.replace("/dashboard");
    }
  }, [sessionData, router]);

  useEffect(() => {
    void handleRedirect();
  }, [handleRedirect]);

  return (
    <div className="mt-28 flex items-center justify-center p-12">
      <h1 className="mt-40 text-3xl text-orange-500">
        Please login to use the app &uarr;
      </h1>
    </div>
  );
}
