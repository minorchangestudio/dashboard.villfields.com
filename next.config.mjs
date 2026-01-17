/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  async redirects() {
    return [
      {
        source: '/r/qr-business-card',
        destination: 'https://villfields.com/',
        permanent: true, // 301 redirect
      },
    ]
  },

  
};

export default nextConfig;
