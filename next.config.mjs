import mdx from '@next/mdx';

const withMDX = mdx({
  extension: /\.mdx?$/,
});

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    // Remove this line:
    // unoptimized: true,
    // Add this instead:
    domains: ['lh3.googleusercontent.com'],
  },
};

export default withMDX(nextConfig);
