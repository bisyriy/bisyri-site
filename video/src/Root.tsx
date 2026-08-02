import React from 'react';
import { Composition } from 'remotion';
import { AeoExplainer } from './AeoExplainer';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AeoExplainer"
        component={AeoExplainer}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
