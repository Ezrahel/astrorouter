# @astroroute/express

Express middleware to automatically expose your development server to the internet via [Outray](https://astroroute.dev) tunnel.

## Installation

```bash
npm install @astroroute/express
```

## Usage

### Basic Usage

```typescript
import express from 'express'
import astroroute from '@astroroute/express'

const app = express()

// Apply Outray middleware
astroroute(app)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

When you start your server in development mode, you'll see:

```
Server running on port 3000
  ➜  Tunnel:  https://quick-tiger.astroroute.app
```

### With Options

```typescript
import express from 'express'
import astroroute from '@astroroute/express'

const app = express()

astroroute(app, {
  subdomain: 'my-app',
  apiKey: process.env.OUTRAY_API_KEY,
  onTunnelReady: (url) => {
    console.log('Tunnel ready at:', url)
  }
})

app.listen(3000)
```

## Options

```typescript
interface OutrayPluginOptions {
  /** Subdomain to use (requires authentication) */
  subdomain?: string;
  
  /** Custom domain (must be configured in dashboard) */
  customDomain?: string;
  
  /** API key for authentication */
  apiKey?: string;
  
  /** AstroRouter server URL */
  serverUrl?: string;
  
  /** Enable/disable tunnel (default: true in development) */
  enabled?: boolean;
  
  /** Suppress logs */
  silent?: boolean;
  
  /** Callback when tunnel is ready */
  onTunnelReady?: (url: string) => void;
  
  /** Callback on error */
  onError?: (error: Error) => void;
  
  /** Callback on reconnecting */
  onReconnecting?: () => void;
  
  /** Callback on close */
  onClose?: () => void;
}
```

## Environment Variables

- `OUTRAY_API_KEY` - Your AstroRouter API key
- `OUTRAY_SUBDOMAIN` - Custom subdomain
- `OUTRAY_ENABLED` - Set to `"false"` to disable
- `OUTRAY_SERVER_URL` - Custom server URL (default: `wss://api.astroroute.dev/`)