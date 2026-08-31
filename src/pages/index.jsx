import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const AppWithoutSSR = dynamic(() => import("@/App"), { ssr: false });

export default function Home() {
    // On Pages the site is served under /pikachu, so a root-absolute icon path
    // 404s. basePath is "" in dev and the configured prefix in the export.
    const { basePath } = useRouter();

    return (
        <>
            <Head>
                <title>Pikachu Connect</title>
                <meta name="description" content="Classic Pikachu emoji matching game built with Phaser 3 and Next.js" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href={`${basePath}/favicon.png`} />
            </Head>
            <main>
                <AppWithoutSSR />
            </main>
        </>
    );
}
