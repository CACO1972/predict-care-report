import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { display, body, GOLD, CREAM, NAVY } from "../theme";

export const SceneReport = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardS = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const scale = interpolate(cardS, [0, 1], [0.85, 1]);
  const op = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const exitOp = interpolate(frame, [78, 90], [1, 0], { extrapolateRight: "clamp" });

  const probability = Math.round(interpolate(frame, [10, 55], [0, 94], { extrapolateRight: "clamp" }));
  const barW = interpolate(frame, [15, 60], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80, opacity: exitOp }}>
      <div style={{
        fontFamily: body, fontWeight: 600, letterSpacing: 8,
        fontSize: 24, color: GOLD, textTransform: "uppercase",
        opacity: op, marginBottom: 40,
      }}>
        Tu informe
      </div>
      <div style={{
        transform: `scale(${scale})`, opacity: op,
        width: 820, background: `linear-gradient(160deg, ${CREAM} 0%, #E8DFCC 100%)`,
        borderRadius: 32, padding: 56,
        boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${GOLD}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div style={{ fontFamily: display, fontWeight: 900, fontSize: 42, color: NAVY, fontStyle: "italic" }}>
            ImplantX
          </div>
          <div style={{ fontFamily: body, fontSize: 22, color: NAVY, opacity: 0.6 }}>
            Reporte #A2847
          </div>
        </div>
        <div style={{ height: 2, background: NAVY, opacity: 0.15, marginBottom: 40 }} />

        <div style={{ fontFamily: body, fontSize: 26, color: NAVY, opacity: 0.7, marginBottom: 10 }}>
          Probabilidad de éxito
        </div>
        <div style={{
          fontFamily: display, fontWeight: 900, fontSize: 200,
          color: NAVY, lineHeight: 1, letterSpacing: -6,
        }}>
          {probability}<span style={{ color: GOLD, fontSize: 120 }}>%</span>
        </div>

        <div style={{ marginTop: 30, height: 14, background: `${NAVY}22`, borderRadius: 999, overflow: "hidden" }}>
          <div style={{
            width: `${barW}%`, height: "100%",
            background: `linear-gradient(90deg, ${GOLD}, #8B6F3A)`,
          }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50 }}>
          {["Óseo", "Encías", "Salud gral."].map((k, i) => (
            <div key={k}>
              <div style={{ fontFamily: body, fontSize: 22, color: NAVY, opacity: 0.6 }}>{k}</div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 44, color: NAVY, marginTop: 6 }}>
                {["A+", "A", "A"][i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
