const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
    ],
  },
  webpack: (config) => {
    // Add worker-loader
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: "asset/resource",
    });
    
    config.resolve.alias.canvas = false;
    
    return config;
  },
};

module.exports = nextConfig;
