import React from "react";
import { AbsoluteFill } from "remotion";
import { InvisibleCutCommercial } from "./commercial/InvisibleCutCommercial";

export const MasterSequence: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#040A18" }}>
      <InvisibleCutCommercial />
    </AbsoluteFill>
  );
};
