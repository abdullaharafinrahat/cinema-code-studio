import React from "react";
import { Composition } from "remotion";
import { MasterSequence, MasterSequenceProps } from "./MasterSequence";
import defaultTimelineJson from "../public/timeline.json";
import { MasterTimelineData } from "./types/timeline";

export function computeEffectiveFrames(timeline: MasterTimelineData): number {
  const rawTotal = timeline.scenes.reduce((acc, s) => acc + s.durationInFrames, 0);
  const overlapTotal = timeline.scenes.slice(0, -1).reduce((acc, s) => {
    if (s.transitionAfter && s.transitionAfter.type !== "none") {
      return acc + s.transitionAfter.durationInFrames;
    }
    return acc;
  }, 0);
  return Math.max(1, rawTotal - overlapTotal);
}

export const RemotionRoot: React.FC = () => {
  const timeline = defaultTimelineJson as unknown as MasterTimelineData;
  const totalFrames = computeEffectiveFrames(timeline);

  return (
    <>
      <Composition<any, MasterSequenceProps>
        id="MasterSequence"
        component={MasterSequence}
        durationInFrames={totalFrames}
        fps={timeline.meta.fps}
        width={timeline.meta.width}
        height={timeline.meta.height}
        defaultProps={{
          timeline,
        }}
      />
    </>
  );
};
