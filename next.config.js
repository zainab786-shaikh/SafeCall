/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: config => {
    config.resolve.alias['@huggingface/transformers$'] = path.resolve(
      __dirname,
      'node_modules/@huggingface/transformers/dist/transformers.web.js',
    );
    return config;
  },
};

module.exports = nextConfig;
