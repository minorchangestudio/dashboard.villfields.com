/** @type {import('next').NextConfig} */
const nextConfig = {
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
