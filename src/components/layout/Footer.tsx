import { brand, getChannels, nav } from "@/content/site";

/**
 * Footer with an oversized wordmark whose letters lift (with their
 * neighbours) under the pointer — typography as the last interaction.
 */
export function Footer() {
  const channels = getChannels().filter((c) => c.kind === "instagram" || c.kind === "tiktok");
  const [first, ...rest] = brand.name.split(" ");
  const year = new Date().getFullYear();

  const letters = (word: string, italic = false) =>
    Array.from(word).map((ch, i) => (
      <span key={`${word}-${i}`} className={`wordmark__ch ${italic ? "italic text-champagne" : ""}`}>
        {ch}
      </span>
    ));

  return (
    <footer className="relative overflow-hidden bg-ink px-5 pb-8 pt-[14vh] md:px-10">
      <div className="mx-auto grid max-w-[1400px] gap-10 border-b hairline pb-12 md:grid-cols-3">
        <p className="max-w-[28ch] font-serif text-2xl leading-snug text-bone/90">{brand.tagline}</p>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="u-link text-sm text-bone/70 hover:text-bone">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-start gap-3 md:items-end">
          {channels.map((c) => (
            <a
              key={c.kind}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="u-link text-sm text-bone/70 hover:text-bone"
            >
              {c.label} <span className="text-mist">{c.value}</span>
            </a>
          ))}
          <a href="#top" className="u-link text-sm text-bone/70 hover:text-bone">
            Back to top ↑
          </a>
        </div>
      </div>

      <p
        aria-label={brand.name}
        className="display mt-[6vh] select-none whitespace-nowrap text-center text-[clamp(4rem,19vw,22rem)] leading-[0.8] text-bone"
      >
        <span aria-hidden="true">
          {letters(first)}
          <span className="inline-block w-[0.2em]" />
          {letters(rest.join(" "), true)}
        </span>
      </p>

      <div className="mx-auto mt-10 flex max-w-[1400px] flex-col justify-between gap-3 text-[0.72rem] tracking-[0.08em] text-mist md:flex-row">
        <p>
          © {year} {brand.name}. All rights reserved.
        </p>
        <p>
          Photography via{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="u-link text-bone/70"
          >
            Unsplash
          </a>
        </p>
      </div>
    </footer>
  );
}
