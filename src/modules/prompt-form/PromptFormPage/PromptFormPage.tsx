import React from "react";
import { useTranslation } from "react-i18next";
import { PromptFormList } from "../PromptFormList/PromptFormList";
import { ContentContainer } from "~/components/ContentContainer/ContentContainer";
import usePromptFormStore from "../usePromptFormStore";

export const PromptFormPage: React.FC = () => {
	const { t } = useTranslation();
	const { rightComponent } = usePromptFormStore((state) => state);
	return (
		<ContentContainer
			title={t("promptForm.page.title")}
			rightSection={rightComponent || <></>}
			description={t("promptForm.page.description")}
		>
			<PromptFormList />
		</ContentContainer>
	);
};
