const testimonials = [
  {
    name: "Kyle Zantos",
    handle: "@kylezantos",
    quote:
      "AICE set up my OpenClaw in under 2 hours. I was dreading the terminal stuff but they handled everything. Now I have an AI assistant that actually works!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Darr Walk",
    handle: "@darrwalk",
    quote:
      "Paid $119 to AICE and got my OpenClaw running the same day. No CLI, no config files, no headaches. Just a working AI in my Telegram.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Jorge M",
    handle: "@JorgeM",
    quote:
      "I tried installing OpenClaw myself for 3 days. Gave up. AICE did it in an hour. Worth every penny.",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    name: "Tyson Hutchins",
    handle: "@tysonhutchins_",
    quote: "AICE made OpenClaw accessible to non-devs like me. Finally AI that normal people can actually use.",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    name: "Clara Chen",
    handle: "@clarac",
    quote:
      "The AICE team was super responsive. They configured everything and even showed me how to use it. 10/10 service.",
    avatar: "https://randomuser.me/api/portraits/women/66.jpg",
  },
  {
    name: "Mina K",
    handle: "@mina.k",
    quote: "Asked AICE to set up OpenClaw with email + calendar integrations. Done in a day. No technical knowledge needed on my end.",
    avatar: "https://randomuser.me/api/portraits/women/52.jpg",
  },
  {
    name: "Albert Moral",
    handle: "@AlbertMoral",
    quote:
      "AICE got my OpenClaw running on a VPS with Cloudflare. I didn't even know what a VPS was before. Now I have my own AI assistant 24/7.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Kevin Tang",
    handle: "@_KevinTang",
    quote: "Best $119 I've spent. AICE handled all the scary terminal stuff. OpenClaw just works now.",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
  },
];

const topRow = testimonials.slice(0, 4);
const bottomRow = testimonials.slice(4, 8);
const topRowItems = [...topRow, ...topRow, ...topRow];
const bottomRowItems = [...bottomRow, ...bottomRow, ...bottomRow];

export default function Testimonials() {
  return (
    <section
      className="relative z-10 mx-auto mt-24 max-w-6xl px-6"
      id="testimonials"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          <span className="mr-2 text-[#ff6b6b]">›</span>
          What People Say
        </h2>
        <a className="text-sm text-[#ff6b6b]" href="#testimonials">
          View all →
        </a>
      </div>

      <div className="relative left-1/2 right-1/2 -mx-[50vw] mt-10 w-screen">
        <div className="marquee relative space-y-8 px-6 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-24 before:bg-gradient-to-r before:from-[#0a0a0f] before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-24 after:bg-gradient-to-l after:from-[#0a0a0f] after:to-transparent">
          <div className="marquee-track reverse">
            {topRowItems.map((testimonial, index) => (
              <article
                key={`${testimonial.handle}-top-${index}`}
                className="glass-card min-w-[280px] max-w-[360px] rounded-2xl p-6 text-sm leading-relaxed text-slate-200 sm:min-w-[320px]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[#ff6b6b]">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="mt-4 text-slate-300">{testimonial.quote}</p>
              </article>
            ))}
          </div>

          <div className="marquee-track">
            {bottomRowItems.map((testimonial, index) => (
              <article
                key={`${testimonial.handle}-bottom-${index}`}
                className="glass-card min-w-[280px] max-w-[360px] rounded-2xl p-6 text-sm leading-relaxed text-slate-200 sm:min-w-[320px]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-[#ff6b6b]">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="mt-4 text-slate-300">{testimonial.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
