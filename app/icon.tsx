import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FDDDE6 0%, #F28BA8 60%, #E07090 100%)",
        borderRadius: "44px",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: 110,
          fontWeight: 300,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          letterSpacing: "-2px",
          textShadow: "0 2px 12px rgba(160,60,80,0.25)",
        }}
      >
        S
      </span>
    </div>,
    { ...size }
  );
}
