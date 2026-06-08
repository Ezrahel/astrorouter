import { Navbar } from "../navbar";
import { Footer } from "../shared";
import { NestJSHero } from "./NestJSHero";
import { NestJSCodeExample } from "./NestJSCodeExample";
import { NestJSUseCases } from "./NestJSUseCases";
import { NestJSCTA } from "./NestJSCTA";

export const NestJSPluginLanding = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent/30">
      <Navbar />

      <NestJSHero />

      <NestJSCodeExample />

      <NestJSUseCases />

      <NestJSCTA />

      <Footer />
    </div>
  );
};
