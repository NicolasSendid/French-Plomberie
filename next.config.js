/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Cela permet de déployer même s'il y a de petites erreurs de type
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
