// src/components/StarRating.tsx
// Yıldız puan gösterimi (sadece okuma veya interaktif)

"use client";

interface StarRatingProps {
  rating: number; // 1-5
  size?: number; // px
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 18, interactive, onChange }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5" style={{ gap: "2px" }}>
      {stars.map((star) => {
        const filled = star <= rating;
        const half = !filled && star - 0.5 <= rating;
        return (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={`transition-transform ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
            style={{ width: size, height: size, padding: 0, background: "none", border: "none" }}
          >
            <svg viewBox="0 0 24 24" fill={filled || half ? "#ffd700" : "none"} stroke="#ffd700" strokeWidth="1.5" width={size} height={size}>
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${star}`}>
                      <stop offset="50%" stopColor="#ffd700" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#half-${star})`} />
                </>
              ) : (
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
