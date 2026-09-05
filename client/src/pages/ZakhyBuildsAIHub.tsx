const ZAKHY_DEMO_HOMEPAGE = "https://zakhydemo-mpd8k29q.manus.space/";

/**
 * The approved Zakhy Builds AI homepage remains the source of truth on its
 * standalone demo host. This isolated production route intentionally embeds
 * that exact page instead of duplicating or redesigning it.
 */
export default function ZakhyBuildsAIHub() {
  return (
    <main style={{ minHeight: "100vh", width: "100%", background: "#fff" }}>
      <iframe
        title="Zakhy Builds AI"
        src={ZAKHY_DEMO_HOMEPAGE}
        style={{ border: 0, display: "block", height: "100vh", minHeight: "760px", width: "100%" }}
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
