export default {
  async fetch(request, env, ctx) {
    // Parse the request URL
    const url = new URL(request.url);
    console.log('Request URL:', url.pathname); // Debug log for troubleshooting

    // Split URL path into parts and remove empty elements
    // Example: '/secure/US' becomes ['secure', 'US']
    const pathParts = url.pathname.split('/').filter(part => part);
    console.log('Path parts:', pathParts); // Debug log for path analysis

    // Check if this request is for the secure endpoint
    // This works for both custom domain and worker URLs
    const isSecureEndpoint = pathParts.includes('secure');
    
    // Handle main /secure path - displays user authentication info
    // Matches when path has only 'secure' part (e.g., /secure)
    if (isSecureEndpoint && pathParts.length === 1) {
      try {
        // Get authentication details from Cloudflare headers
        const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'Anonymous';
        const country = request.headers.get('Cf-Ipcountry') || 'US'; // Default to US if not available
        const timestamp = new Date().toISOString();

        // Log authentication details for debugging
        console.log('Auth details:', { email, country, timestamp });

        // Create response with format: "${EMAIL} authenticated at ${TIMESTAMP} from ${COUNTRY}"
        // Country is wrapped in HTML link that points to flag endpoint
        const response = `${email} authenticated at ${timestamp} from <a href="/secure/${country}">${country}</a>`;

        // Return HTML response
        return new Response(response, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } catch (error) {
        // Log and handle any errors during processing
        console.error('Error:', error);
        return new Response('Error processing request', { status: 500 });
      }
    }

    // Handle country-specific flag requests
    // Matches paths like /secure/US, /secure/GB, etc.
    if (isSecureEndpoint && pathParts.length === 2) {
      try {
        // Get country code from URL path
        const country = pathParts[1];
        console.log('Requested country:', country);

        // Validate country code exists
        if (!country) {
          return new Response('Country code is required', { status: 400 });
        }

        // Attempt to fetch flag image from R2 bucket
        // Flag files should be stored with lowercase names (e.g., us.png, gb.png)
        const flagObject = await env.FLAGS_BUCKET.get(`${country.toLowerCase()}.png`);
        
        // Handle case where flag image doesn't exist
        if (!flagObject) {
          return new Response(`Flag not found for country: ${country}`, { status: 404 });
        }

        // Return flag image with appropriate headers
        return new Response(flagObject.body, {
          headers: {
            'Content-Type': 'image/png', // Set content type for images
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
          }
        });
      } catch (error) {
        // Log and handle any errors during flag fetching
        console.error('Error:', error);
        return new Response('Error fetching flag', { status: 500 });
      }
    }

    // Return 404 for any unmatched paths
    return new Response('Not Found', { status: 404 });
  },
};
