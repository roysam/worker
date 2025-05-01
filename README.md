<h1 align="center">Cloudflare Worker</h1>

<p align="center">
  <br>
  Cloudflare Worker to display user email address, logged in time and country origin.
  <br>
</p>

<hr>

## Quick Start

To get started quickly with a new project, run the command below:

```bash
# Authenticate to Cloudflare account
npx wrangler login

# wrangler.toml
# - Update WORKER_NAME with the deployed worker route to /secure
# - Update R2_CC__IMAGES_BUCKET-NAME where it stores the countries flags images in this format cc.png

# index.js
# - Place this file under src directory

# deploy
wrangler deploy
```

For more info, visit our [Getting Started](https://developers.cloudflare.com/workers/get-started/guide/) guide.

## Documentation

- [Developers](https://developers.cloudflare.com/workers/)
                                          
## Links

- [YouTube](https://www.youtube.com/watch?v=H7Qe96fqg1M)
