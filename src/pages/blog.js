import Script from 'next/script';

export default function BlogPage() {
  return (
    <>
      <style jsx global>{`
        #soro-blog {
          color: #f5f5f5;
          background-color: #000000;
        }

        #soro-blog h1,
        #soro-blog h2,
        #soro-blog h3,
        #soro-blog p,
        #soro-blog span,
        #soro-blog time,
        #soro-blog a {
          color: #f5f5f5;
        }
      `}</style>

      <div id="soro-blog"></div>

      <Script
        src="https://app.trysoro.com/api/embed/07d3aead-54ab-43cd-b99d-6791c24828a9"
        strategy="afterInteractive"
      />
    </>
  );
}
