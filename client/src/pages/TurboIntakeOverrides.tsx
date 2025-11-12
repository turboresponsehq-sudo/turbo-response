export const TurboIntakeStyles = () => (
  <style>{`
    /* FORCE VISIBILITY OF ALL LABELS */
    .turbo-intake-page label {
      color: #ffffff !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      opacity: 1 !important;
      display: block !important;
      margin-bottom: 8px !important;
    }

    /* FORCE VISIBILITY OF ALL INPUTS */
    .turbo-intake-page input,
    .turbo-intake-page textarea,
    .turbo-intake-page select {
      background-color: #ffffff !important;
      color: #000000 !important;
      border: 1px solid #222 !important;
      font-size: 15px !important;
      padding: 12px !important;
      opacity: 1 !important;
    }

    /* PLACEHOLDER TEXT FIX */
    .turbo-intake-page input::placeholder,
    .turbo-intake-page textarea::placeholder {
      color: #555 !important;
      opacity: 1 !important;
      font-weight: 500 !important;
    }

    /* INPUT BOX SHADOW FOR CONTRAST */
    .turbo-intake-page input,
    .turbo-intake-page textarea {
      box-shadow: 0 0 6px rgba(0,0,0,0.35) !important;
      border-radius: 6px !important;
    }

    /* SECTION TITLES */
    .turbo-intake-page h2,
    .turbo-intake-page h3,
    .turbo-intake-page h4,
    .turbo-intake-page .section-title {
      color: #ffffff !important;
      font-weight: 700 !important;
      opacity: 1 !important;
    }

    /* REQUIRED ASTERISK */
    .turbo-intake-page .required {
      color: #ff4444 !important;
    }
  `}</style>
);
