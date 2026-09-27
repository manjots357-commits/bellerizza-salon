"use client";

import { useRef } from "react";
import { booking, brand, contact, getChannels } from "@/content/site";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { RevealImage } from "@/components/ui/RevealImage";
import { ChannelIcon } from "@/components/ui/Icons";
import { useTilt } from "@/hooks/useTilt";

/**
 * Conversion moment. Only real, configured channels are rendered — anything
 * missing from `contact` in site.ts simply doesn't appear. In development a
 * note explains what to fill in when nothing is configured yet.
 */
export function Booking() {
  const channels = getChannels();
  const arch = useRef<HTMLDivElement>(null);
  useTilt(arch, 3);
  const hasDetails = contact.address || contact.hours.length > 0;

  return (
    <section
      id="visit"
      aria-labelledby="visit-title"
      className="relative overflow-hidden border-t hairline bg-espresso px-5 py-[16vh] md:px-10"
    >
      {/* Soft champagne bloom behind the arch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[20vw] top-[10%] h-[80vw] w-[80vw] rounded-full bg-[radial-gradient(circle,rgb(196_160_106/0.14),transparent_62%)]"
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-[5fr_7fr] lg:gap-[6vw]">
        <div ref={arch} className="relative mx-auto w-[78%] max-w-[480px] will-change-transform lg:mx-0 lg:w-full">
          <RevealImage
            image={booking.image}
            sizes="(min-width: 1024px) 38vw, 78vw"
            className="aspect-[3/4.2] rounded-t-full"
            from="bottom"
            parallax={8}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-[5%] translate-y-[3%] rounded-t-full border border-champagne/25"
          />
        </div>

        <div>
          <p className="eyebrow">
            <span className="text-gold">06</span> — Visit
          </p>
          <AnimatedText
            as="h2"
            id="visit-title"
            split="chars"
            cursor="text"
            stagger={0.02}
            className="display mt-6 text-[clamp(3.6rem,9.5vw,10rem)] text-bone"
          >
            Reserve your <em>moment.</em>
          </AnimatedText>
          <AnimatedText className="mt-8 max-w-[42ch] text-[0.98rem] leading-relaxed text-bone/75">
            {`Tell us what you have in mind and we'll find the time for it. ${brand.name} welcomes you by appointment.`}
          </AnimatedText>

          {channels.length > 0 ? (
            <ul className="mt-12 flex flex-wrap gap-3" aria-label="Ways to book">
              {channels.map((c, i) => (
                <li key={c.kind}>
                  <MagneticButton
                    href={c.href}
                    external={c.href.startsWith("http")}
                    variant={i === 0 ? "solid" : "ghost"}
                    icon={<ChannelIcon kind={c.kind} />}
                    ariaLabel={`${c.label}: ${c.value}`}
                  >
                    {c.label}
                  </MagneticButton>
                </li>
              ))}
            </ul>
          ) : (
            process.env.NODE_ENV === "development" && (
              <div className="mt-12 max-w-[46ch] border border-dashed border-gold/40 p-5 text-sm leading-relaxed text-champagne/80">
                <strong className="font-semibold">Developer note:</strong> no booking channels are configured.
                Add WhatsApp, phone, email, Maps link, Instagram or TikTok in{" "}
                <code className="text-bone">src/content/site.ts</code> — buttons appear here automatically. This
                note never renders in production.
              </div>
            )
          )}

          {hasDetails && (
            <dl className="mt-14 grid gap-8 border-t hairline pt-8 sm:grid-cols-2">
              {contact.address && (
                <div>
                  <dt className="eyebrow">Studio</dt>
                  <dd className="mt-3 text-bone/85">{contact.address}</dd>
                </div>
              )}
              {contact.hours.length > 0 && (
                <div>
                  <dt className="eyebrow">Hours</dt>
                  <dd className="mt-3 space-y-1 text-bone/85">
                    {contact.hours.map(([d, h]) => (
                      <p key={d} className="flex justify-between gap-6">
                        <span>{d}</span>
                        <span className="text-bone/60">{h}</span>
                      </p>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
