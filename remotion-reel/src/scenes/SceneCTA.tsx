import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { display, body, GOLD, CREAM } from "../theme";

export const SceneCTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const y1 = interpolate(s1, [0, 1], [40, 0]);
  const op1 = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const s2 = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 90 } });
  const scale2 = interpolate(s2, [0, 1], [0.85, 1]);
  const op2 = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp" });

  const s3 = spring({ frame: frame - 25, fps, config: { damping: 18 } });
  const op3 = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" });

  const pulse = interpolate(frame % 60, [0, 30, 60], [1, 1.04, 1]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{
        transform: `translateY(${y1}px)`, opacity: op1,
        fontFamily: body, fontWeight: 600, letterSpacing: 8,
        fontSize: 26, color: GOLD, textTransform: "uppercase", marginBottom: 30,
      }}>
        Comienza ahora
      </div>

      <div style={{
        transform: `scale(${scale2 * pulse})`, opacity: op2,
        fontFamily: display, fontStyle: "italic", fontWeight: 900,
        fontSize: 150, color: CREAM, lineHeight: 0.95,
        textAlign: "center", letterSpacing: -3,
      }}>
        Evalúa
      </div>
      <div style={{
        transform: `scale(${scale2 * pulse})`, opacity: op2,
        fontFamily: display, fontWeight: 700,
        fontSize: 100, lineHeight: 0.95,
        background: `linear-gradient(180deg, ${GOLD} 0%, #8B6F3A 100%)`,
        WebkitBackgroundClip: "text", backgroundClip: "text",
        color: "transparent", textAlign: "center", marginTop: 10,
        letterSpacing: -2,
      }}>
        gratis en 5 min
      </div>

      <div style={{
        opacity: op3, marginTop: 80,
        padding: "28px 70px", borderRadius: 999,
        border: `2px solid ${GOLD}`,
        fontFamily: body, fontWeight: 700, fontSize: 40, color: CREAM,
        letterSpacing: 2,
        boxShadow: `0 0 40px ${GOLD}55`,
        transform: `scale(${pulse})`,
      }}>
        implantx.cl
      </div>

      <div style={{
        opacity: op3, marginTop: 60, textAlign: "center",
        fontFamily: body, fontSize: 26, color: CREAM, opacity: op3 * 0.7,
      }}>
        by Clínica Miró · Providencia, Santiago
      </div>
    </AbsoluteFill>
  );
};
