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
        <Skeleton variant="title" width="60%" style={{ margin: "0 auto 16px" }} />
        <Skeleton variant="text" width="80%" style={{ margin: "0 auto" }} />
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
        <Skeleton variant="title" width="50%" style={{ margin: "0 auto" }} />
      </div>

      <div className="skeleton-form">
        {/* Price Display Skeleton */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Skeleton variant="title" width="40%" style={{ margin: "0 auto 16px" }} />
          <Skeleton variant="text" width="60%" style={{ margin: "0 auto" }} />
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
