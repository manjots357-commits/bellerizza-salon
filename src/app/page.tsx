import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/sections/Preloader";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Services } from "@/components/sections/Services";
import { Ritual } from "@/components/sections/Ritual";
import { Story } from "@/components/sections/Story";
import { Gallery } from "@/components/sections/Gallery";
import { Booking } from "@/components/sections/Booking";

export default function Home() {
  return (
    <>
      <Preloader />
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        <Services />
        <Ritual />
        <Story />
        <Gallery />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
