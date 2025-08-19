import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import DispositionCatalogList from "../DispositionCatalogList";
import { useDispositionStore } from "../dispositionRightComponentStore";
import DispositionCatalogNode from "../DispositionCatalogForm/DispositionCatalogNode";
import FallbackRightComponent from "~/components/FallbackRightComponent";
import { useEffect } from "react";

const DispositionPage: React.FC = () => {
  const { rightComponent, catalog, setRightComponent } = useDispositionStore(
    (s) => s
  );

  // clean the right component
  useEffect(() => {
    return () => {
      setRightComponent(null);
    };
  }, []);

  return (
    <ContentContainer
      title="Dispositions"
      description="Manage all disposition catalogs."
      rightSection={
        rightComponent || (
          <FallbackRightComponent
            title="No catalog selected"
            description={
              "Select a disposition catalog from the list to view and edit its nodes, or create a new catalog to get started."
            }
            actionText="Use the left list to choose or create a catalog"
          />
        )
      }
    >
      <DispositionCatalogList />
      {catalog && <DispositionCatalogNode catalogId={catalog.id} />}
    </ContentContainer>
  );
};

export default DispositionPage;
