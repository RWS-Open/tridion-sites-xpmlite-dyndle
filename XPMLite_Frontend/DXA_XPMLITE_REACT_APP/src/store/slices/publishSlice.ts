import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Dayjs } from "dayjs";
import getService from "../../Services/getRequest";
import formatTcmId from "../../utils/formatTcmId";

interface IChildPublication {
    Id: string;
    Title: string;
}

interface IMappedPublication {
    key: string;
    name: string;
    Id: string;
}

interface IFetchTargetTypesResponse {
    parentPublication: IMappedPublication;
    publicationTarget: IMappedPublication[];
}

export const fetchTargetTypes = createAsyncThunk<IFetchTargetTypesResponse | undefined, string>("publish/fetchTargetTypes", async (pageId, { dispatch, rejectWithValue }) => {
    try {
        const response = await getService.getItems(pageId);
        const owningRepositoryId = response.data?.BluePrintInfo?.OwningRepository?.IdRef;

        if (!owningRepositoryId) {
            return rejectWithValue("Owning repository ID missing from item blueprint data.");
        }

        const pubId = formatTcmId(owningRepositoryId);
        const publicationResponse = await getService.getItems(pubId);

        if (publicationResponse?.status === 200 && publicationResponse.data) {
            const businessProcessTypeId = formatTcmId(publicationResponse.data.BusinessProcessType?.IdRef || "");
            const publishingTargetTypes = await getService.getPublishableTargetTypes(businessProcessTypeId);

            const publicationTarget = (publishingTargetTypes?.data || []).map((item: Record<string, unknown>) => ({
                key: item.Id,
                name: item.Title,
                Id: item.Id
            }));

            const parentPublication = {
                key: publicationResponse.data.Id,
                name: publicationResponse.data.Title,
                Id: publicationResponse.data.Id
            };

            if (publicationResponse.data.HasChildren) {
                dispatch(fetchChildPublications(pubId));
            }
            return { parentPublication, publicationTarget };
        }
    } catch (error: any) {
        console.error("Error fetching publication target layout structures:", error);
        return rejectWithValue(error?.response?.data || "Failed to fetch target types");
    }
});

export const fetchChildPublications = createAsyncThunk<IMappedPublication[], string>("publish/fetchChildPublications", async (pubId, { rejectWithValue }) => {
    try {
        const childPublicationsResponse = await getService.getChildPublications(pubId);
        return (childPublicationsResponse.data || []).map((item: IChildPublication) => ({
            key: item.Id,
            name: item.Title,
            Id: item.Id,
        }));
    } catch (error: any) {
        console.error(`Error fetching child publications for ${pubId}:`, error);
        return rejectWithValue(error?.response?.data || "Failed to fetch child publications");
    }
});

interface DataType {
    name: string;
    Id: string;
    key: string;
}

interface IParentPublication {
    key: string;
    name: string;
    Id: string;
}

interface AdditionalSettingsProps {
    [linkedItems: string]: number;
}

interface PublishState {
    parentPublication: IParentPublication;
    childPublications: DataType[];
    selectedChildPublications: string[];
    selectedPublishingTarget: string[];
    publishingSchedule: number;
    publishPriority: string;
    publishToCurrentPublication: boolean;
    publishDate: Dayjs | null;
    additionalSettings: AdditionalSettingsProps;
    targetTypes: DataType[];
    isLoading: boolean;
    errorMessage: string | null;
    ispublishRequested: boolean;
}

const initialState: PublishState = {
    parentPublication: { key: "", name: "", Id: "" },
    childPublications: [],
    selectedChildPublications: [],
    selectedPublishingTarget: [],
    publishingSchedule: 1,
    publishPriority: "Normal",
    publishToCurrentPublication: true,
    publishDate: null,
    additionalSettings: {
        linkedItems: 1,
        itemsInProgress: 1,
        overridePriority: 1,
    },
    targetTypes: [],
    isLoading: false,
    errorMessage: null,
    ispublishRequested: false
};

const publishSlice = createSlice({
    name: "publish",
    initialState,
    reducers: {
        setChildPublications: (state, action: PayloadAction<DataType[]>) => {
            state.childPublications = action.payload;
        },
        setSelectedChildPublications: (state, action: PayloadAction<string[]>) => {
            state.selectedChildPublications = action.payload;
        },
        setSelectedPublishingTarget: (state, action: PayloadAction<string[]>) => {
            state.selectedPublishingTarget = action.payload;
        },
        setPublishingSchedule: (state, action: PayloadAction<number>) => {
            state.publishingSchedule = action.payload;
        },
        setPublishPriority: (state, action: PayloadAction<string>) => {
            state.publishPriority = action.payload;
        },
        setCurrentPublicationToPublishing: (state, action: PayloadAction<boolean>) => {
            state.publishToCurrentPublication = action.payload;
        },
        setPublishDate: (state, action: PayloadAction<Dayjs | null>) => {
            state.publishDate = action.payload;
        },
        setAdditionalSettings: (state, action: PayloadAction<AdditionalSettingsProps>) => {
            state.additionalSettings = action.payload;
        },
        setTargetTypes: (state, action: PayloadAction<DataType[]>) => {
            state.targetTypes = action.payload;
        },
        setParentPublication: (state, action: PayloadAction<IParentPublication>) => {
            state.parentPublication = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setErrorMessage: (state, action: PayloadAction<string | null>) => {
            state.errorMessage = action.payload;
        },
        setIspublishRequested: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchTargetTypes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTargetTypes.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.targetTypes = action.payload.publicationTarget;
                    state.parentPublication = action.payload.parentPublication;
                }
            })
            .addCase(fetchTargetTypes.rejected, (state) => {
                state.isLoading = false;
            });

        builder
            .addCase(fetchChildPublications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchChildPublications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.childPublications = action.payload || [];
            })
            .addCase(fetchChildPublications.rejected, (state) => {
                state.isLoading = false;
            });
    },
});

export const {
    setChildPublications,
    setSelectedChildPublications,
    setSelectedPublishingTarget,
    setPublishingSchedule,
    setPublishPriority,
    setCurrentPublicationToPublishing,
    setPublishDate,
    setAdditionalSettings,
    setTargetTypes,
    setParentPublication,
    setLoading,
    setErrorMessage,
    setIspublishRequested
} = publishSlice.actions;

export default publishSlice.reducer;
