import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import DispositionCatalogList from "../DispositionCatalogList";
import { useDispositionRightComponentStore } from "../dispositionRightComponentStore";
import styles from "./DispositionPage.module.css";

const DispositionPage: React.FC = () => {
  const rightComponent = useDispositionRightComponentStore(
    (s) => s.rightComponent
  );
  return (
    <ContentContainer
      title="Dispositions"
      description="Manage all disposition catalogs."
      rightSection={rightComponent || <></>}
    >
      <div className={styles.root}>
        <DispositionCatalogList />
      </div>
    </ContentContainer>
  );
};

export default DispositionPage;
