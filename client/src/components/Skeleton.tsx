import "./Skeleton.css";

interface SkeletonProps {
  variant?: "text" | "title" | "input" | "button" | "card" | "avatar";
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant = "text", width, height, className = "" }: SkeletonProps) {
  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return <div className={`skeleton skeleton-${variant} ${className}`} style={style} />;
}

export function FormSkeleton() {
  return (
    <div className="skeleton-form">
      <Skeleton variant="title" />
      <Skeleton variant="text" className="short" />
      
      <div className="skeleton-form-group">
        <div className="skeleton-label skeleton" />
        <Skeleton variant="input" />
      </div>

      <div className="skeleton-form-group">
        <div className="skeleton-label skeleton" />
        <Skeleton variant="input" />
      </div>

      <div className="skeleton-form-group">
        <div className="skeleton-label skeleton" />
        <Skeleton variant="input" />
      </div>

      <div className="skeleton-form-group">
        <div className="skeleton-label skeleton" />
        <Skeleton variant="input" />
      </div>

      <Skeleton variant="button" />
    </div>
  );
}

export function IntakeFormSkeleton() {
  return (
    <div className="skeleton-container">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ margin: "0 auto 16px", width: "60%" }}>
          <Skeleton variant="title" width="100%" />
        </div>
        <div style={{ margin: "0 auto", width: "80%" }}>
          <Skeleton variant="text" width="100%" />
        </div>
      </div>

      <div className="skeleton-form">
        {/* Category Selection Skeleton */}
        <div className="skeleton-form-group">
          <div className="skeleton-label skeleton" />
          <div className="skeleton-grid">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="skeleton-form-group">
          <div className="skeleton-label skeleton" />
          <Skeleton variant="input" />
        </div>

        <div className="skeleton-form-group">
          <div className="skeleton-label skeleton" />
          <Skeleton variant="input" />
        </div>

        <div className="skeleton-form-group">
          <div className="skeleton-label skeleton" />
          <Skeleton variant="input" height="120px" />
        </div>

        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function PaymentSkeleton() {
  return (
    <div className="skeleton-container">
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ margin: "0 auto", width: "50%" }}>
          <Skeleton variant="title" width="100%" />
        </div>
      </div>

      <div className="skeleton-form">
        {/* Price Display Skeleton */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ margin: "0 auto 16px", width: "40%" }}>
            <Skeleton variant="title" width="100%" />
          </div>
          <div style={{ margin: "0 auto", width: "60%" }}>
            <Skeleton variant="text" width="100%" />
          </div>
        </div>

        {/* Payment Info Skeleton */}
        <div className="skeleton-form-group">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="short" />
        </div>

        <div className="skeleton-form-group">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="short" />
        </div>

        {/* Payment Methods Skeleton */}
        <div className="skeleton-form-group">
          <div className="skeleton-label skeleton" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>

        <Skeleton variant="button" />
      </div>
    </div>
  );
}
