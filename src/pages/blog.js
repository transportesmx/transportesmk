import Script from 'next/script';

export default function BlogPage() {
  return (
    <>
      <div id="soro-blog"></div>

      <Script
        src="https://app.trysoro.com/api/embed/07d3aead-54ab-43cd-b99d-6791c24828a9"
        strategy="afterInteractive"
      />
    </>
  );
}
