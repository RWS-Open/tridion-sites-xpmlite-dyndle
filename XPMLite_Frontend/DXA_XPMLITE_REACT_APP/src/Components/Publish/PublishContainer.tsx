import { useEffect } from "react";
import { ConfigProvider, Tabs } from "antd";
import type { TabsProps } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { IPublishData } from "../../model/PageModel";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setErrorMessage, setLoading, setPublishDate } from "../../store/slices/publishSlice";

import AdditionalSettings from "./AdditionalSettings";
import General from "./General";
import formatTcmId from "../../utils/formatTcmId";
import getService from "../../Services/getRequest";
import postService from "../../Services/postRequest";
import { theme } from "./Index";

interface IPublishProps {
	isPublishRequested: boolean
	setIsPublishRequested: (isPublishRequested: boolean) => void;
	pageIdToPublish?: string;
}


const PublishContainer = ({ isPublishRequested, setIsPublishRequested, pageIdToPublish }: IPublishProps) => {
	const {
		selectedChildPublications,
		selectedPublishingTarget,
		publishingSchedule,
		publishPriority,
		publishToCurrentPublication,
		publishDate,
		additionalSettings,
	} = useAppSelector((state) => state.publishReducer);
	const { pageId } = useAppSelector(state => state.pageReducer)
	const dispatch = useAppDispatch();
	const currentDate = new Date();
	const formatDate = dayjs(currentDate);

	useEffect(() => {
		if (!isPublishRequested) return;
		publishPage();
		dispatch(setPublishDate(formatDate));
	}, [isPublishRequested]);


	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	const pollPublishStatus = async (publishQueueId: string, maxRetries = 20) => {
		let retries = 0;
		while (retries < maxRetries) {
			const response = await getPagePublishStatus(publishQueueId);

			const { IsCompleted, State, Information, Items } = response.data;

			if (IsCompleted && State === "Success") {
				dispatch(setLoading(false));
				setIsPublishRequested(false)
				const publishedPageId = Items[0].IdRef.replace(/:/g, "_");
				const publishedPageUrl = await getService.getPublishedPageUrl(
					publishedPageId
				);

				window.open(publishedPageUrl.data[0].Uri, "_self");
				return;
			}

			if (IsCompleted && State === "Failed") {
				dispatch(setErrorMessage(Information));
				dispatch(setLoading(false));
				setIsPublishRequested(false)
				return;
			}

			if (State === "ScheduledForDeployment") {
				dispatch(setLoading(false));
				return;
			}
			retries++;
			await delay(3000);
		}
		dispatch(setLoading(false));
		setIsPublishRequested(false)
		dispatch(
			setErrorMessage(`The publishing operation is taking longer than expected. Unable to confirm the publishing status. Please try again later or contact your administrator.`)
		);
	};
	const publishPage = async () => {
		dispatch(setErrorMessage(null))
		const pageTcmId = pageIdToPublish ? pageIdToPublish : pageId?.split("_").join(":")
		if (selectedPublishingTarget.length !== 0) {
			dispatch(setLoading(true))
			const publishData = {
				Ids: [pageTcmId],
				Priority: publishPriority,
				TargetIdsOrPurposes: selectedPublishingTarget,
				PublishInstruction: {
					ResolveInstruction: {
						IncludeChildPublications: false,
						IncludeComponentLinks:
							additionalSettings["linkedItems"] === 2 ? false : true,
						IncludeCurrentPublication: publishToCurrentPublication,
						IncludeDynamicVersion:
							additionalSettings["overridePriority"] === 2 ? true : false,
						IncludeWorkflow:
							additionalSettings["itemsInProgress"] === 2 ? true : false,
						PublishInChildPublications: selectedChildPublications,
						PublishNewContent: true,
					},
				},
			} as IPublishData;
			if (publishingSchedule === 2 && publishDate !== null) {
				const dateInUtc = publishDate["$d" as keyof Dayjs] as any;
				publishData.PublishInstruction["DeployAt"] = dateInUtc.toISOString();
			}
			try {
				const publishResponse = await postService.publish(publishData);
				if (publishResponse?.status === 202) {
					const publishQueueId = formatTcmId(publishResponse.data.PublishTransactionIds[0]);
					await pollPublishStatus(publishQueueId);
				}
			} catch (err) {
				console.log(err);
				dispatch(setErrorMessage(`Failed to publish the page:${err}`))
				dispatch(setLoading(false))
				setIsPublishRequested(false)
			}
		}
	};
	const getPagePublishStatus = async (id: string) => {
		const tcmid = id;
		const publishStatusResponse = await getService.getPublishStatus(tcmid);
		return publishStatusResponse;
	};
	const items: TabsProps["items"] = [
		{
			key: "1",
			label: "General ",
			children: <General />,
		},
		{
			key: "2",
			label: "Additional Settings",
			children: <AdditionalSettings />,
		},
	];
	return (
		<ConfigProvider theme={theme}>
			<div style={{ padding: "0px 10px", textAlign: "left" }}>
				<Tabs defaultActiveKey="1" items={items} />
			</div>
		</ConfigProvider>
	);
};

export default PublishContainer;
