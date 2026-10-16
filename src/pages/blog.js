import Script from 'next/script';

export default function BlogPage() {
return React.createElement(
'div',
null,
React.createElement('div', { id: 'soro-blog' }),
React.createElement(Script, {
src: 'https://app.trysoro.com/api/embed/07d3aead-54ab-43cd-b99d-6791c24828a9',
strategy: 'afterInteractive'
})
);
}
