import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Link from "next/link";
import { useRouter } from "next/router";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

const Header = () => {
  const location = useRouter();
  const { pathname } = location;

  return (
    <header className="fixed top-0 z-50 w-full bg-black text-3xl text-white">
      <nav className="w-full">
        <ul className="flex w-full justify-center gap-8 py-8">
          <li>
            <Link
              href="/dashboard"
              className={
                pathname == "/dashboard"
                  ? "underline decoration-4 underline-offset-8"
                  : ""
              }
            >
              DASHBOARD
            </Link>
          </li>
          <li>
            <Link
              href="/blocks"
              className={
                pathname == "/blocks"
                  ? "underline decoration-4 underline-offset-8"
                  : ""
              }
            >
              BLOCKS
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default api.withTRPC(MyApp);
