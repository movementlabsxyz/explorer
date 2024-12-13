import * as React from "react";
import {useGetBlockByVersion} from "../../../../api/hooks/useGetBlock";
import ContentRow from "../../../../components/IndividualPageContent/ContentRow";
import {getLearnMoreTooltip} from "../../helpers";
import {Link} from "../../../../routing";

export default function TransactionBlockRow({
  version,
  color,
}: {
  version: string;
  color: string;
}) {
  const {data} = useGetBlockByVersion({version: parseInt(version)});

  if (!data) {
    return null;
  }

  return (
    <ContentRow
      title="Block:"
      titleColor={color}
      value={
        <Link to={`/block/${data.block_height}`} underline="none">
          {data.block_height}
        </Link>
      }
      tooltip={getLearnMoreTooltip("block_height")}
    />
  );
}
