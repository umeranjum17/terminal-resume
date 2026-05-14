import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role}, ${profile.location}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0d0d12",
        color: "#e6e1cf",
        fontFamily: "monospace",
        padding: "72px 96px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#565f89" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#f7768e" }} />
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#e0af68" }} />
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#9ece6a" }} />
        </div>
        <div style={{ display: "flex", fontSize: 24 }}>
          {profile.terminal.handle}@{profile.terminal.host}: ~
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", fontSize: 28, color: "#565f89" }}>$ whoami</div>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            color: "#ff9e64",
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          {profile.name.toLowerCase()}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 36 }}>
          <span style={{ color: "#e6e1cf" }}>{profile.role.toLowerCase()}</span>
          <span style={{ color: "#565f89" }}>·</span>
          <span style={{ color: "#7dcfff" }}>{profile.focus.toLowerCase()}</span>
          <span style={{ color: "#565f89" }}>·</span>
          <span style={{ color: "#e6e1cf" }}>{profile.location.toLowerCase()}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#565f89",
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex" }}>{profile.website}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ color: "#9ece6a" }}>$</span>
          <span>_</span>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
