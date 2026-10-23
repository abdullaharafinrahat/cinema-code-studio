import React from "react";
import { Composition } from "remotion";
import { MasterSequence } from "./MasterSequence";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MasterSequence"
      component={MasterSequence}
      durationInFrames={913}
      fps={25}
      width={1920}
      height={1080}
    />
  );
};
