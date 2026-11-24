import { Reveal } from '@/components/Reveal';
import { festival } from '@/content/festival';

/** Dress code: the four festival colours. */
export function DressCode() {
  return (
    <section
      id="dress-code"
      aria-labelledby="dress-title"
      className="scroll-mt-24 overflow-hidden bg-night py-24"
    >
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="eyebrow text-gold">Dress code</p>
          <h2 id="dress-title" className="display mt-4 text-6xl sm:text-7xl">
            Wear the colours
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-cream/80">
            Purple, cream, red or green. Wear one, wear them all, or bring them together in African
            print.
          </p>
        </Reveal>
        <ul className="mt-14 flex flex-wrap justify-center gap-6 sm:gap-10">
          {festival.dressColours.map((c, i) => (
            <li key={c.name}>
              <Reveal delay={i * 0.08} rotate={i % 2 ? 8 : -8}>
                <span
                  className="block size-28 rounded-full border-[6px] border-peach shadow-[8px_10px_0_rgb(0_0_0/0.4)] sm:size-36"
                  style={{ background: c.hex }}
                />
                <span className="display mt-4 block text-3xl">{c.name}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
