import { useState } from 'react'
import { Alert, Button, ConfigProvider, Modal } from 'antd';

import { useAppDispatch, useAppSelector } from '../../store/connect';
import PublishContainer from './PublishContainer';
import { setErrorMessage, setSelectedChildPublications, setSelectedPublishingTarget } from '../../store/publish/publishSlice';

const themeStyle = {
    Tabs: {
        itemSelectedColor: "#007373",
        itemHoverColor: "#007373",
        inkBarColor: "#007373"
    },
    Modal: {
        wireframe: true,

    },
    Button: {
        colorPrimary: "#007373",
        colorPrimaryBg: "#007373",
        colorPrimaryActive: "#007373",
        colorPrimaryHover: "#007373",
        colorPrimaryBorderHover: "#007373",
    },
    Checkbox: {
        colorBorder: "#9199ad",
        colorPrimary: "#007373",
        colorPrimaryHover: "#007373"
    },
    Radio: {
        colorBorder: "#9199ad",
        colorPrimary: "#007373",
        colorPrimaryHover: "#007373"
    },
    Table: {
        headerColor: "#5e667a",
        fontWeightStrong: 400,
        colorBgContainer: "#fff",
        cellPaddingInline: 10,
        cellPaddingBlock: 10
    }
}

export const theme = {
    components: themeStyle,
};

const Publish = () => {
    const dispatch = useAppDispatch()
    const { selectedPublishingTarget, publishToCurrentPublication, selectedChildPublications, isLoading, errorMessage } = useAppSelector(state => state.publishReducer)
    const { isLoading: pageInfoLoading } = useAppSelector(state => state.pageInfoReducer)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPublishRequested, setIsPublishRequested] = useState(false)

    const showModal = () => setIsModalOpen(true);

    const handleCancel = () => {
        dispatch(setSelectedPublishingTarget([]))
        dispatch(setSelectedChildPublications([]))
        setIsPublishRequested(false)
        setIsModalOpen(false);
        dispatch(setErrorMessage(null))
    };
    const isPublishAllowed = selectedPublishingTarget.length === 0 || (publishToCurrentPublication === false && selectedChildPublications.length === 0)
    return (
        <ConfigProvider theme={theme}>
            <Button
                style={{ fontVariant: "normal" }}
                onClick={showModal}
                className="drawer-btn"
                type="default"
                size='middle'
                title='Publish'
            >
                Publish
            </Button>
            <Modal
                centered
                title="Publish"
                open={isModalOpen}
                closable={!isLoading}
                onCancel={isLoading ? undefined : handleCancel}
                maskClosable={!isLoading}
                footer={
                    <>
                        {!!errorMessage && <Alert type='error' style={{ textAlign: "left", marginBottom: 5 }} message={errorMessage} />}
                        <Button
                            type="primary"
                            loading={isLoading || pageInfoLoading}
                            disabled={isPublishAllowed}
                            onClick={() => setIsPublishRequested(true)}
                            style={{ marginRight: 8 }}
                        >
                            Publish
                        </Button>
                        <Button onClick={handleCancel}>Cancel</Button>
                    </>
                }
                width={{
                    xs: "95%",
                    sm: "90%",
                    md: 700,
                    lg: 800,
                    xl: 1000,
                }}
                styles={{
                    content: {
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "90vh",
                    },
                    body: {
                        maxHeight: "calc(100vh - 220px)",
                        overflowY: "auto",
                        padding: "10px 20px"
                    },
                }}
            >
                <PublishContainer isPublishRequested={isPublishRequested} setIsPublishRequested={setIsPublishRequested}/>
            </Modal>
        </ConfigProvider>

    )
}

export default Publish