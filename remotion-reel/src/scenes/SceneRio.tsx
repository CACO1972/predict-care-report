import { AbsoluteFill, Video, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { display, body, GOLD, CREAM } from "../theme";

export const SceneRio = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });
  const s = interpolate(scale, [0, 1], [0.7, 1]);
  const op = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const labelY = interpolate(spring({ frame: frame - 15, fps, config: { damping: 15 } }), [0, 1], [40, 0]);
  const labelOp = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  const nameY = interpolate(spring({ frame: frame - 30, fps, config: { damping: 15 } }), [0, 1], [60, 0]);
  const nameOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  const exitOp = interpolate(frame, [105, 120], [1, 0], { extrapolateRight: "clamp" });

  const ringRot = interpolate(frame, [0, 120], [0, 90]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 60, opacity: exitOp }}>
      <div style={{ position: "relative", width: 780, height: 780, transform: `scale(${s})`, opacity: op }}>
        {/* Glow */}
        <div style={{
          position: "absolute", inset: -60, borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}55 0%, transparent 70%)`,
          filter: "blur(30px)",
        }} />
        {/* Rotating gold ring */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid ${GOLD}`,
          transform: `rotate(${ringRot}deg)`,
          borderTopColor: "transparent",
          borderRightColor: `${GOLD}55`,
        }} />
        {/* Inner ring */}
        <div style={{
          position: "absolute", inset: 30, borderRadius: "50%",
          border: `1px solid ${GOLD}66`,
        }} />
        {/* Video circle */}
        <div style={{
          position: "absolute", inset: 50, borderRadius: "50%", overflow: "hidden",
          border: `3px solid ${GOLD}`,
          boxShadow: `0 0 80px ${GOLD}44, inset 0 0 40px rgba(0,0,0,0.4)`,
        }}>
          <Video
            src={staticFile("video/rio-avatar-1.mp4")}
            muted
            startFrom={0}
            style={{ width: "100%", height: "120%", objectFit: "cover", objectPosition: "center 25%" }}
          />
        </div>
        {/* Live dot */}
        <div style={{
          position: "absolute", bottom: 60, right: 80,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          padding: "10px 22px", borderRadius: 999,
          border: `1px solid ${GOLD}66`,
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: body, fontSize: 22, color: CREAM, fontWeight: 600,
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 12px #4ade80",
          }} />
          En línea
        </div>
      </div>

      <div style={{
        marginTop: 80, textAlign: "center",
        transform: `translateY(${labelY}px)`, opacity: labelOp,
      }}>
        <div style={{
          fontFamily: body, fontWeight: 600, letterSpacing: 6,
          fontSize: 26, color: GOLD, textTransform: "uppercase",
        }}>
          Te presentamos a
        </div>
      </div>
      <div style={{
        marginTop: 20, textAlign: "center",
        transform: `translateY(${nameY}px)`, opacity: nameOp,
      }}>
        <div style={{
          fontFamily: display, fontWeight: 900, fontStyle: "italic",
          fontSize: 180, color: CREAM, lineHeight: 1,
          letterSpacing: -3,
        }}>
          Río
        </div>
        <div style={{
          fontFamily: body, fontWeight: 400, fontSize: 32, color: CREAM,
          opacity: 0.75, marginTop: 10,
        }}>
          tu asistente dental con IA
        </div>
      </div>
    </AbsoluteFill>
  );
};
