
import Script from 'next/script';

export default function BlogPage() {
  return (
    <>
      <style jsx global>{`
        #soro-blog {
          color: #f5f5f5 !important;
          background-color: #000000;
        }

        #soro-blog h1,
        #soro-blog h2,
        #soro-blog h3,
        #soro-blog h4,
        #soro-blog p,
        #soro-blog span,
        #soro-blog time,
        #soro-blog li,
        #soro-blog ul,
        #soro-blog ol,
        #soro-blog strong,
        #soro-blog em,
        #soro-blog blockquote,
        #soro-blog div {
          color: #f5f5f5 !important;
        }

        #soro-blog a {
          color: #ffffff !important;
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
