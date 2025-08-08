import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import DispositionCatalogList from "../DispositionCatalogList";
import styles from "./DispositionPage.module.css";
import { useDispositionStore } from "../dispositionRightComponentStore";
import DispositionCatalogNode from "../DispositionCatalogForm/DispositionCatalogNode";

const DispositionPage: React.FC = () => {
  const { rightComponent, catalog } = useDispositionStore((s) => s);
  return (
    <ContentContainer
      title="Dispositions"
      description="Manage all disposition catalogs."
      rightSection={rightComponent || <></>}
    >
      <div className={styles.root}>
        <DispositionCatalogList />
        {catalog && <DispositionCatalogNode catalogId={catalog.id} />}
      </div>
    </ContentContainer>
  );
};

export default DispositionPage;
