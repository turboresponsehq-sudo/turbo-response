import { ArrowUpRight, ChevronRight, MapPin, Mic2, Play, UtensilsCrossed } from "lucide-react";
import type { CSSProperties } from "react";

const experienceImage = "https://zakhydemo-mpd8k29q.manus.space/manus-storage/miami-experiences-approved_cf1a739f_49cc20d6.webp";
const experienceImageMobile = "https://zakhydemo-mpd8k29q.manus.space/manus-storage/miami-experiences-approved_cf1a739f-mobile_1e868e43.webp";

const episodes = [
  ["01", "TABLE TALK", "The places worth dressing up for—and the plates worth crossing town for."],
  ["02", "WEEKEND WINDOWS", "A smarter way to take in the city, from check-in to last call."],
  ["03", "THE NEXT FLIGHT", "Destination notes, hotel energy, and the moments beyond the itinerary."],
];
const destinations = ["Brickell After Dark", "Miami Beach Before Noon", "Little Havana, Slowly"];
const restaurants = ["Waterfront Tables", "Chef’s Counter Finds", "Late-Night Reservations"];

function MiamiPageHeader() {
  return <header className="miami-sub-header"><a className="miami-wordmark" href="/zakhybuildsai/portfolio/miami-trips-restaurants"><strong>MIAMI<span>✦</span></strong><small>TRIPS AND RESTAURANTS</small></a><nav><a href="/zakhybuildsai/portfolio/miami-trips-restaurants">HOME</a><a className="is-active" href="/zakhybuildsai/portfolio/miami-trips-restaurants/experiences">EPISODES &amp; EXPERIENCES</a><a href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries">INQUIRIES</a></nav><a className="miami-header-cta" href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries">GET IN TOUCH <ArrowUpRight /></a></header>;
}

export default function MiamiExperiences() {
  return <main className="miami-page miami-experiences-page">
    <MiamiPageHeader />
    <section className="miami-experiences-hero"><div className="miami-experience-hero-photo" style={{ "--miami-experience-desktop": `url(${experienceImage})`, "--miami-experience-mobile": `url(${experienceImageMobile})` } as CSSProperties} /><div className="miami-experience-hero-shade" /><div className="miami-shell"><p className="miami-eyebrow">EPISODES &amp; EXPERIENCES</p><h1>TASTE THE CITY.<br /><em>SEE THE WORLD.</em></h1><p>Explore podcast episodes, restaurant discoveries, destination files, and the experiences that turn curiosity into a lifestyle brand.</p><a className="miami-button" href="#episodes">EXPLORE THE LATEST <ChevronRight /></a></div></section>

    <section className="miami-section miami-episodes" id="episodes"><div className="miami-shell"><div className="miami-section-heading"><div><p className="miami-eyebrow">01 / ON THE MIC</p><h2>THE CITY<br /><em>HAS A TABLE.</em></h2></div><p>Editorial conversations around the restaurants, people, neighborhoods, and trips that deserve a closer look.</p></div><div className="miami-episode-grid">{episodes.map(([number, title, body]) => <article key={number} className="miami-episode-card"><span>{number}</span><Mic2 /><h3>{title}</h3><p>{body}</p><button type="button">PLAY PREVIEW <Play /></button></article>)}</div></div></section>

    <section className="miami-section miami-destination-section" id="destinations"><div className="miami-shell"><div className="miami-section-heading"><div><p className="miami-eyebrow">02 / GO SOMEWHERE</p><h2>DESTINATION<br /><em>FILES.</em></h2></div><p>From a perfect 24 hours to an extended escape, each guide turns the city into a reason to go.</p></div><div className="miami-route-grid">{destinations.map((title, index) => <article key={title} className={`miami-route-card miami-route-card--${index + 1}`}><MapPin /><span>MIAMI / {String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><a href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries">REQUEST A PARTNERSHIP <ArrowUpRight /></a></article>)}</div></div></section>

    <section className="miami-section miami-restaurant-section" id="restaurants"><div className="miami-shell miami-restaurant-layout"><div className="miami-restaurant-photo" style={{ backgroundImage: `url(${experienceImage})` }}><span>THE<br />TABLE<br />EDIT.</span></div><div className="miami-restaurant-list"><p className="miami-eyebrow">03 / RESTAURANT NOTES</p><h2>GOOD TASTE<br /><em>TRAVELS.</em></h2><p className="miami-rest-copy">The restaurant side of the brand is built for discovery—high-touch hospitality, chef stories, and experiences that give audiences a reason to book.</p>{restaurants.map((item, index) => <div className="miami-restaurant-row" key={item}><span>0{index + 1}</span><UtensilsCrossed /><strong>{item}</strong><ArrowUpRight /></div>)}</div></div></section>

    <section className="miami-revenue-strip" id="about"><div className="miami-shell"><p className="miami-eyebrow">BUILT TO TRAVEL FURTHER</p><h2>CONTENT WITH<br /><em>PLACES TO GO.</em></h2><div>{["Episodes", "Destination guides", "Restaurant partnerships", "Travel campaigns", "Hosted experiences"].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div><a className="miami-button" href="/zakhybuildsai/portfolio/miami-trips-restaurants/inquiries">WORK TOGETHER <ChevronRight /></a></div></section>
  </main>;
}
