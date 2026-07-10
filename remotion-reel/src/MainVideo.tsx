import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneHook } from "./scenes/SceneHook";
import { SceneRio } from "./scenes/SceneRio";
import { SceneFeatures } from "./scenes/SceneFeatures";
import { SceneReport } from "./scenes/SceneReport";
import { SceneCTA } from "./scenes/SceneCTA";

const NAVY = "#0B1E3A";
const NAVY_DEEP = "#050D1F";
const GOLD = "#C9A86C";

const GrainAndVignette = () => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(frame % 120, [0, 60, 120], [0.35, 0.55, 0.35]);
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${GOLD}22 0%, transparent 55%), radial-gradient(ellipse at 70% 85%, ${GOLD}18 0%, transparent 60%), linear-gradient(180deg, ${NAVY_DEEP} 0%, ${NAVY} 50%, #000000 100%)`,
          opacity: shimmer + 0.5,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export const MainVideo = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <GrainAndVignette />
      <Series>
        <Series.Sequence durationInFrames={60}><SceneHook /></Series.Sequence>
        <Series.Sequence durationInFrames={120}><SceneRio /></Series.Sequence>
        <Series.Sequence durationInFrames={90}><SceneFeatures /></Series.Sequence>
        <Series.Sequence durationInFrames={90}><SceneReport /></Series.Sequence>
        <Series.Sequence durationInFrames={durationInFrames - 360}><SceneCTA /></Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
