import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { display, body, GOLD, CREAM } from "../theme";

export const SceneHook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const y = interpolate(titleY, [0, 1], [60, 0]);
  const op1 = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const goldReveal = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const kicker = interpolate(frame, [18, 30], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [50, 60], [0, -40], { extrapolateRight: "clamp" });
  const exitOp = interpolate(frame, [50, 60], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ transform: `translateY(${y + exit}px)`, opacity: op1 * exitOp, textAlign: "center" }}>
        <div style={{
          fontFamily: body,
          fontWeight: 600,
          letterSpacing: 8,
          fontSize: 28,
          color: GOLD,
          textTransform: "uppercase",
          opacity: kicker,
          marginBottom: 40,
        }}>
          Clínica Miró · IA Predictiva
        </div>
        <div style={{
          fontFamily: display,
          fontWeight: 700,
          color: CREAM,
          fontSize: 130,
          lineHeight: 0.95,
          letterSpacing: -2,
        }}>
          ¿Necesitas
        </div>
        <div style={{
          fontFamily: display,
          fontWeight: 900,
          fontSize: 160,
          lineHeight: 0.95,
          letterSpacing: -3,
          background: `linear-gradient(180deg, ${GOLD} 0%, #8B6F3A 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          fontStyle: "italic",
        }}>
          implantes?
        </div>
        <div style={{
          width: goldReveal * 220,
          height: 3,
          background: GOLD,
          margin: "50px auto 0",
        }} />
      </div>
    </AbsoluteFill>
  );
};
