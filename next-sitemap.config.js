/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://gelectra.tech', // your main domain
  generateRobotsTxt: true,          // generates robots.txt automatically
  sitemapSize: 7000,                // splits sitemap if more than 7000 URLs
  changefreq: 'daily',              // tells search engines how often pages change
  priority: 0.7,                    // default priority for pages
  exclude: ['/secret-page'],        // optional: pages to exclude from sitemap
};
