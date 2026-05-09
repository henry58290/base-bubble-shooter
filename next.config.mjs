/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // wagmi / RainbowKit pull in optional deps that don't exist in the browser bundle.
    // Marking them external prevents noisy build warnings.
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    // MetaMask SDK has a soft dep on the React Native async-storage shim. Aliasing
    // it to `false` tells webpack to treat it as a no-op in browser builds.
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

export default nextConfig;
