import { CatalogView } from "@/components/CatalogView";
import { buildClusters } from "@/lib/clusters";
import { getMockups } from "@/lib/mockups";

export default function Home() {
  const mockups = getMockups();
  const clusters = buildClusters(mockups);

  return <CatalogView mockups={mockups} clusters={clusters} />;
}
