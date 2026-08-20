const fs = require('fs');
const https = require('https');

// Cloudinary Credentials
const apiKey = '844741323181695';
const apiSecret = 'snyspO816H7fWWddvWE0L4C_Cj8';
const cloudName = 'xm0awdem';
const tag = 'ecgm-gallery';

const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

const fetchByTag = (resourceType) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/tags/${tag}?max_results=100`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${auth}` }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Failed to fetch ${resourceType}: ${res.statusCode} ${body}`));
            return;
          }
          try {
            const parsed = JSON.parse(body);
            resolve(parsed.resources || []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
};

async function buildGallery() {
  console.log('Fetching media assets from Cloudinary...');
  try {
    const [images, videos] = await Promise.all([
      fetchByTag('image'),
      fetchByTag('video')
    ]);

    const mediaList = [
      ...images.map(img => ({
        public_id: img.public_id,
        version: img.version,
        format: img.format,
        width: img.width,
        height: img.height,
        type: 'image'
      })),
      ...videos.map(vid => ({
        public_id: vid.public_id,
        version: vid.version,
        format: vid.format,
        width: vid.width,
        height: vid.height,
        type: 'video'
      }))
    ];

    // Sort by latest uploads
    mediaList.sort((a, b) => b.version - a.version);

    fs.writeFileSync('./js/gallery-data.json', JSON.stringify(mediaList, null, 2));
    console.log(`Success! Written ${mediaList.length} items to ./js/gallery-data.json`);
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

buildGallery();
