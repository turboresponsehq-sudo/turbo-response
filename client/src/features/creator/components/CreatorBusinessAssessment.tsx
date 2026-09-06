import { assessQualification, type AssessmentLead } from "@shared/creator/qualification";
import { buildCreatorProfile, type ProfileRating } from "@shared/creator/profile";

type CreatorBusinessAssessmentProps = {
  lead: AssessmentLead;
};

const ratingClass: Record<ProfileRating, string> = {
  STRONG: "creator-assessment-rating strong",
  AVERAGE: "creator-assessment-rating average",
  "NEEDS HELP": "creator-assessment-rating needs-help",
};

export default function CreatorBusinessAssessment({ lead }: CreatorBusinessAssessmentProps) {
  const qualification = assessQualification(lead);
  const profile = buildCreatorProfile(lead);

  return (
    <section className="creator-assessment" aria-labelledby="creator-business-assessment-heading">
      <div className="creator-assessment-heading">
        <div>
          <p className="creator-eyebrow">READ-ONLY DECISION SUPPORT</p>
          <h3 id="creator-business-assessment-heading">Creator Business Assessment</h3>
        </div>
        <span className="creator-assessment-badge">Preview only</span>
      </div>

      <div className="creator-assessment-summary">
        <article>
          <span>Qualification</span>
          <strong>{qualification.category}</strong>
          <small>Website {qualification.websiteScore} · Automation {qualification.automationScore} · System {qualification.systemScore}</small>
        </article>
        <article>
          <span>Recommended next action</span>
          <p>{qualification.recommendedNextAction}</p>
        </article>
      </div>

      <div className="creator-assessment-columns">
        <div>
          <h4>Why</h4>
          <ul className="creator-assessment-list">
            {qualification.why.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
        <div>
          <h4>Recommended services</h4>
          {profile.recommendedServices.length ? (
            <div className="creator-assessment-service-list">
              {profile.recommendedServices.map((service) => <span key={service}>{service}</span>)}
            </div>
          ) : <p className="creator-assessment-muted">No additional service recommendation from the current fields.</p>}
        </div>
      </div>

      <div className="creator-assessment-profile">
        <div className="creator-assessment-profile-head">
          <h4>Strength &amp; Weakness Profile</h4>
          <span>{profile.strengths.length} strengths · {profile.weaknesses.length} needs help</span>
        </div>
        <div className="creator-assessment-dimensions">
          {profile.dimensions.map((dimension) => (
            <article key={dimension.name}>
              <div><strong>{dimension.name}</strong><span className={ratingClass[dimension.rating]}>{dimension.rating}</span></div>
              <p>{dimension.evidence}</p>
              {dimension.rating === "NEEDS HELP" && <small>Service mapping: {dimension.recommendedServices.join(" · ")}</small>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
