# @astroroute/nest

NestJS integration for [Outray](https://astroroute.dev), the open-source tunneling solution. Automatically expose your local NestJS server to the internet during development.

## Installation

```bash
npm install @astroroute/nest
# or
pnpm add @astroroute/nest
# or
yarn add @astroroute/nest
```

## Usage

Import the `astroroute` function and call it in your `main.ts` file after your application starts listening.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { astroroute } from '@astroroute/nest';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Start the server
  await app.listen(3000);

  // Start the tunnel in development
  if (process.env.NODE_ENV !== 'production') {
    await astroroute(app);
  }
}
bootstrap();
```

## Configuration

You can pass options to the `astroroute` function:

```typescript
await astroroute(app, {
  // Optional: Explicitly specify port (auto-detected otherwise)
  port: 3000,
  
  // Optional: Request a specific subdomain
  subdomain: 'my-cool-app',
  
  // Optional: Use a custom domain
  customDomain: 'api.example.com',
  
  // Optional: Suppress console output
  silent: false,
});
```

### Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | `number` | Auto-detected | The local port your NestJS app is running on. |
| `subdomain` | `string` | Random | Request a specific subdomain. |
| `apiKey` | `string` | `process.env.OUTRAY_API_KEY` | Your AstroRouter API key. |
| `enabled` | `boolean` | `true` (in dev) | Whether to enable the tunnel. |
| `silent` | `boolean` | `false` | specific to Console logs. |
| `onTunnelReady` | `(url: string) => void` | - | Callback when tunnel is ready. |

## License

MIT
