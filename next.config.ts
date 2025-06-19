import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "encrypted-tbn0.gstatic.com",
      "p2l29aocj8.ufs.sh"
    ]
  },
};

// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:5207/api/:path*', // Перенаправление на ASP.NET
//       },
//     ];
//   },
// };

export default nextConfig;
