import mdx from '@next/mdx';

const withMDX = mdx({
  extension: /\.mdx?$/
});

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    unoptimized: true
  },
  };

export default withMDX(nextConfig);
