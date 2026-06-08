import { motion } from "motion/react";

export const NestJSCodeExample = () => {
  return (
    <div className="py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              One function.
              <br />
              <span className="text-white/50">Zero configuration.</span>
            </h2>
            <p className="text-lg text-white/40 leading-relaxed mb-8">
              Import the plugin, call it after your app starts listening, and you're done. 
              The tunnel starts automatically with smart port detection. 
              No extra setup required.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/signup"
                className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                Get Started
              </a>
              <a
                href="/docs/nestjs-plugin"
                className="px-6 py-3 bg-transparent text-white/50 hover:text-white transition-colors"
              >
                Documentation →
              </a>
            </div>
          </motion.div>

          {/* Right side - Code example */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="bg-white/5 border-b border-white/5 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <span className="text-xs text-white/40 ml-2">main.ts</span>
            </div>
            <div className="p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-white/70">
                <code>
                  <span className="text-accent">import</span> {"{"} NestFactory {"}"}{" "}
                  <span className="text-accent">from</span>{" "}
                  <span className="text-green-400/80">'@nestjs/core'</span>;{"\n"}
                  <span className="text-accent">import</span> {"{"} AppModule {"}"}{" "}
                  <span className="text-accent">from</span>{" "}
                  <span className="text-green-400/80">'./app.module'</span>;{"\n"}
                  <span className="text-accent">import</span> {"{"} astroroute {"}"}{" "}
                  <span className="text-accent">from</span>{" "}
                  <span className="text-green-400/80">'@astroroute/nest'</span>;{"\n"}
                  {"\n"}
                  <span className="text-accent">async function</span> bootstrap() {"{"}
                  {"\n"}
                  {"  "}<span className="text-accent">const</span> app = <span className="text-accent">await</span> NestFactory.create(AppModule);{"\n"}
                  {"\n"}
                  {"  "}<span className="text-white/40">{"// Start the server"}</span>{"\n"}
                  {"  "}<span className="text-accent">await</span> app.listen(<span className="text-blue-400">3000</span>);{"\n"}
                  {"\n"}
                  {"  "}<span className="text-white/40">{"// Start the tunnel"}</span>{"\n"}
                  {"  "}<span className="text-accent">await</span> astroroute(app);{"\n"}
                  {"}"}{"\n"}
                  bootstrap();
                </code>
              </pre>
            </div>

            {/* Terminal output preview */}
            <div className="border-t border-white/5 p-6 bg-black/30">
              <div className="font-mono text-sm space-y-1">
                <p className="text-white/30">$ npm run start:dev</p>
                <p className="text-white/50 mt-3">
                  [Nest] Application is running on: http://localhost:3000
                </p>
                <p className="text-white/50">
                  <span className="text-green-400">➜</span>{" "}
                  <span className="font-bold">Tunnel:</span>{"  "}
                  <span className="text-accent">https://quick-tiger.astroroute.app</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
