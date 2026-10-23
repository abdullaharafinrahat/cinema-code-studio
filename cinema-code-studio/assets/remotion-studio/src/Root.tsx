import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { MasterSequence, MasterSequenceProps } from "./MasterSequence";
import defaultTimelineJson from "../public/timeline.json";
import { MasterTimelineData } from "./types/timeline";

/**
 * v4 hardcoded the timeline import, so every render showed the bundled reference reel.
 * The timeline is now an input prop:
 *
 *   npx remotion render MasterSequence ../out/picture.mp4 --props=../preprod/render-props.json
 *
 * `render-props.json` is produced by scripts/build_render_props.py from the project's
 * 05_timeline.json. `public/timeline.json` is only the fallback for `remotion studio`.
 */

const defaultTimeline = defaultTimelineJson as unknown as MasterTimelineData;

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

const calculateMetadata: CalculateMetadataFunction<MasterSequenceProps> = ({ props }) => {
  const timeline = props.timeline ?? defaultTimeline;
  return {
    durationInFrames: computeEffectiveFrames(timeline),
    fps: timeline.meta.fps,
    width: timeline.meta.width,
    height: timeline.meta.height,
    props: { timeline },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<any, MasterSequenceProps>
        id="MasterSequence"
        component={MasterSequence}
        durationInFrames={computeEffectiveFrames(defaultTimeline)}
        fps={defaultTimeline.meta.fps}
        width={defaultTimeline.meta.width}
        height={defaultTimeline.meta.height}
        defaultProps={{
          timeline: defaultTimeline,
        }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
