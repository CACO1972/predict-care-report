import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { display, body, GOLD, CREAM } from "../theme";

const items = [
  { n: "01", t: "Cuestionario", s: "guiado por IA" },
  { n: "02", t: "Análisis clínico", s: "en tiempo real" },
  { n: "03", t: "Informe personalizado", s: "listo en 5 minutos" },
];

export const SceneFeatures = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const exitOp = interpolate(frame, [78, 90], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80, opacity: exitOp }}>
      <div style={{
        fontFamily: body, fontWeight: 600, letterSpacing: 8,
        fontSize: 26, color: GOLD, textTransform: "uppercase",
        opacity: titleOp, marginBottom: 30,
      }}>
        Cómo funciona
      </div>
      <div style={{
        fontFamily: display, fontStyle: "italic", fontWeight: 700,
        fontSize: 90, color: CREAM, opacity: titleOp,
        marginBottom: 80, textAlign: "center", lineHeight: 1,
      }}>
        3 pasos.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 44, width: "100%", maxWidth: 780 }}>
        {items.map((it, i) => {
          const s = spring({ frame: frame - (18 + i * 12), fps, config: { damping: 18, stiffness: 100 } });
          const x = interpolate(s, [0, 1], [-80, 0]);
          const op = interpolate(frame, [18 + i * 12, 34 + i * 12], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={it.n} style={{
              transform: `translateX(${x}px)`, opacity: op,
              display: "flex", alignItems: "center", gap: 36,
              borderTop: `1px solid ${GOLD}44`, paddingTop: 34,
            }}>
              <div style={{
                fontFamily: display, fontWeight: 900, fontSize: 88,
                color: GOLD, fontStyle: "italic", minWidth: 140,
              }}>
                {it.n}
              </div>
              <div>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: 62, color: CREAM, lineHeight: 1 }}>
                  {it.t}
                </div>
                <div style={{ fontFamily: body, fontWeight: 300, fontSize: 32, color: CREAM, opacity: 0.7, marginTop: 8 }}>
                  {it.s}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
