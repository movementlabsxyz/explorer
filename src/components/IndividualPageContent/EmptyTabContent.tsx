import React from "react";
import ContentBox from "./ContentBox";
import GradientBorderBox from "./GradientBorderBox";

type EmptyTabContentProps = {
  message?: React.ReactNode;
};

export default function EmptyTabContent({message}: EmptyTabContentProps) {
  return (
    <GradientBorderBox>
      <ContentBox>{message ?? `No Data Found`}</ContentBox>
    </GradientBorderBox>
  );
}
