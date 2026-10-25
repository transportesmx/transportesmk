import Head from "next/head";
import BannerEditor from "@/components/banner/BannerEditor";

export default function BannerPage() {
  return (
    <>
      <Head>
        <title>Banner | Transportes MX</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <BannerEditor />
    </>
  );
}
