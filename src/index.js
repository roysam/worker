export default {
  async fetch(request, env, ctx) {
    // Parse the request URL
    const url = new URL(request.url);
    console.log('Request URL:', url.pathname);

    // Split URL path into parts and remove empty elements
    const pathParts = url.pathname.split('/').filter(part => part);
    console.log('Path parts:', pathParts);

    // Check if this request is for the secure endpoint
    const isSecureEndpoint = pathParts.includes('secure');
    
    // Handle main /secure path - displays user authentication info
    if (isSecureEndpoint && pathParts.length === 1) {
      try {
        const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'Anonymous';
        const country = request.headers.get('Cf-Ipcountry') || 'US';
        const timestamp = new Date().toISOString();

        console.log('Auth details:', { email, country, timestamp });

        const htmlResponse = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Authentication Status</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                .container {
                  background-color: white;
                  padding: 2rem;
                  border-radius: 10px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  max-width: 650px;
                  width: 100%;
                }
                .auth-info {
                  color: #333;
                  line-height: 1.6;
                  font-size: 1.1rem;
                }
                .country-link {
                  color: #2563eb;
                  text-decoration: none;
                  font-weight: 500;
                  padding: 2px 6px;
                  border-radius: 4px;
                  transition: all 0.2s ease;
                }
                .country-link:hover {
                  background-color: #2563eb;
                  color: white;
                }
                .email {
                  font-weight: bold;
                  color: #1f2937;
                }
                .timestamp {
                  color: #6b7280;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="auth-info">
                  <span class="email">${email}</span> authenticated at 
                  <span class="timestamp">${timestamp}</span> from 
                  <a class="country-link" href="/secure/${country}">${country}</a>
                </div>
              </div>
            </body>
          </html>
        `;

        return new Response(htmlResponse, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      } catch (error) {
        console.error('Error:', error);
        return new Response('Error processing request', { status: 500 });
      }
    }

    // Handle flag page request (HTML wrapper)
    if (isSecureEndpoint && pathParts.length === 2 && pathParts[1].length === 2) {
      const country = pathParts[1];
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Flag of ${country}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f5f5f5;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .flag-wrapper {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
              }
              .flag-image {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="flag-wrapper">
              <img src="/secure/${country}/image" alt="Flag of ${country}" class="flag-image">
            </div>
          </body>
        </html>
      `;

      return new Response(htmlResponse, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // Handle direct flag image requests
    if (isSecureEndpoint && pathParts.length === 3 && pathParts[2] === 'image') {
      try {
        const country = pathParts[1];
        const flagObject = await env.FLAGS_BUCKET.get(`${country.toLowerCase()}.png`);
        
        if (!flagObject) {
          return new Response(`Flag not found for country: ${country}`, { status: 404 });
        }

        return new Response(flagObject.body, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      } catch (error) {
        console.error('Error:', error);
        return new Response('Error fetching flag', { status: 500 });
      }
    }

    // Return 404 for any unmatched paths
    return new Response('Not Found', { status: 404 });
  },
};
