import React, { useEffect, useState, useCallback } from "react";
import "./style.scss";
import ContentLoader from "react-content-loader";
import { useDispatch, useSelector } from "react-redux";
import { getMentorsList } from "../../redux/mentor/actions";
import { Badge, Button, Container, Modal, ModalBody, ModalFooter, ModalHeader } from "shards-react";
import ChatBox from "../../components/ChatBox";
import { connectMentor } from "../../redux/chat/actions";
import queryString from "query-string";
import withHeader from "../../HOC/withHeader";
import MentorItem from "../../components/MentorItem";

function ChooseMentorPage(props) {
    const dispatch = useDispatch();
    const mentorsList = useSelector((state) => state.mentor.mentorsList);
    const isLoading = useSelector((state) => state.mentor.isLoading);
    const currentUser = useSelector((state) => state.user.currentUser);
    const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
    const [modalInfoIsOpening, setModalInfoIsOpening] = useState(false);
    const [activeMentor, setActiveMentor] = useState({});
    const [selectedMentor, setSelectedMentor] = useState({});
    const [openChatBox, setOpenChatBox] = useState(false);
    const isLargeScreen = window.innerWidth > 576;
    const { mentor: mentorId } = queryString.parse(props.location.search);

    const openModalInfo = (mentor) => {
        setModalInfoIsOpening(true);
        setActiveMentor(mentor);
    };
    const closeModalInfo = () => {
        setModalInfoIsOpening(false);
    };
    const chooseMentor = useCallback(
        (mentor) => {
            if (isAuthenticated && selectedMentor.id !== mentor.id) {
                setSelectedMentor(mentor);
                setOpenChatBox(true);
                dispatch(connectMentor([currentUser.id, mentor.user.id]));
            } else if (isAuthenticated && selectedMentor.id === mentor.id) {
                setOpenChatBox(true);
            } else if (!isAuthenticated) {
                props.history.push(`/sign-in?mentor=${mentor.id}`);
            }
        },
        [currentUser.id, dispatch, isAuthenticated, props.history, selectedMentor.id]
    );
    const closeChatBox = () => {
        setOpenChatBox(false);
    };

    useEffect(() => {
        dispatch(getMentorsList());
    }, [dispatch]);

    useEffect(() => {
        if (mentorId && mentorsList?.length) {
            const mentor = mentorsList.find((m) => m.id === mentorId);
            chooseMentor(mentor);
        }
    }, [mentorsList, mentorId, chooseMentor]);

    const LoaderList = () => {
        const list = [];
        const rOfCircle = isLargeScreen ? "15" : "50";
        const xOfFirstTextLine = isLargeScreen ? "50" : "125";
        const yOfFirstTextLine = isLargeScreen ? "0" : +2 * rOfCircle + 20;
        const heightOfFirstTextLine = isLargeScreen ? "8" : "20";
        const widthOfFirstTextLine = isLargeScreen ? "100" : "130";
        const xOfSecondTextLine = isLargeScreen ? "50" : "80";
        const yOfSecondTextLine = isLargeScreen ? "15" : +yOfFirstTextLine + +heightOfFirstTextLine + 10;
        const heightOfSecondTextLine = isLargeScreen ? "8" : "20";
        const widthOfSecondTextLine = isLargeScreen ? "150" : "220";
        const xOfFirstBtn = isLargeScreen ? "322" : "0";
        const yOfFirstBtn = isLargeScreen ? "0" : +yOfSecondTextLine + +heightOfSecondTextLine + 20;
        const widthOfFirstBtn = isLargeScreen ? "58" : "170";
        const heighOfFirstBtn = isLargeScreen ? "13" : "40";
        const xOfSecondBtn = isLargeScreen ? "322" : 380 - widthOfFirstBtn;
        const yOfSecondBtn = isLargeScreen ? "20" : yOfFirstBtn;

        for (let i = 0; i < 8; i++) {
            list.push(
                <ContentLoader
                    key={i}
                    className='mentor-item'
                    viewBox={isLargeScreen ? "0 0 380 33" : "0 0 380 255"}
                    backgroundColor='#bdbdbd'
                    foregroundColor='#ccc'
                >
                    <circle cx={isLargeScreen ? rOfCircle : "190"} cy={rOfCircle} r={rOfCircle} />
                    <rect
                        x={xOfFirstTextLine}
                        y={yOfFirstTextLine}
                        rx='4'
                        ry='4'
                        width={widthOfFirstTextLine}
                        height={heightOfFirstTextLine}
                    />
                    <rect
                        x={xOfSecondTextLine}
                        y={yOfSecondTextLine}
                        rx='3'
                        ry='3'
                        width={widthOfSecondTextLine}
                        height={heightOfSecondTextLine}
                    />
                    <rect
                        x={xOfFirstBtn}
                        y={yOfFirstBtn}
                        rx='3'
                        ry='3'
                        width={widthOfFirstBtn}
                        height={heighOfFirstBtn}
                    />
                    <rect
                        x={xOfSecondBtn}
                        y={yOfSecondBtn}
                        rx='3'
                        ry='3'
                        width={widthOfFirstBtn}
                        height={heighOfFirstBtn}
                    />
                </ContentLoader>
            );
        }
        return list;
    };

    return (
        <div className='choose-mentor-page'>
            <Container>
                {isLoading ? (
                    <LoaderList />
                ) : (
                    <div className='mentors-list'>
                        {mentorsList.map((mentor) => (
                            <MentorItem mentor={mentor} openModalInfo={openModalInfo} chooseMentor={chooseMentor} />
                        ))}
                    </div>
                )}
                {openChatBox ? <ChatBox receiver={selectedMentor} closeChatBox={closeChatBox} /> : null}
            </Container>
            <Modal open={modalInfoIsOpening} toggle={closeModalInfo} backdropClassName='backdrop-info-modal'>
                <ModalHeader>Thông tin Mentor</ModalHeader>
                <ModalBody>
                    <div>Tên: {activeMentor.user?.name}</div>
                    <div>Năm sinh: {new Date(activeMentor.user?.dateOfBirth).getFullYear()}</div>
                    <div>Công việc hiện tại: {activeMentor.currentJob}</div>
                    <div>Số năm kinh nghiệm: {activeMentor.numberOfYearsExperience} năm</div>
                    <div>
                        <span className='mr-2'>Có thể mentor</span>
                        {activeMentor.specialities?.map((speciality) => (
                            <Badge key={speciality} className='mr-1' theme='dark'>
                                {speciality}
                            </Badge>
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button theme='secondary' onClick={closeModalInfo}>
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default withHeader(ChooseMentorPage);
