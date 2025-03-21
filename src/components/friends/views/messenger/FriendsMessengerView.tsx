import { FollowFriendMessageComposer, ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AddEventLinkTracker, GetSessionDataManager, GetUserProfile, LocalizeText, RemoveLinkEventTracker, ReportType, SendMessageComposer } from '../../../../api';
import { Base, Button, ButtonGroup, Column, Flex, Grid, LayoutAvatarImageView, LayoutBadgeImageView, LayoutGridItem, LayoutItemCountView, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../../../common';
import { useHelp, useMessenger } from '../../../../hooks';
import { FriendsMessengerThreadView } from './messenger-thread/FriendsMessengerThreadView';

export const FriendsMessengerView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ isCollapsed, setIsCollapsed ] = useState(false);
    const [ lastThreadId, setLastThreadId ] = useState(-1);
    const [ messageText, setMessageText ] = useState('');
    const { visibleThreads = [], activeThread = null, getMessageThread = null, sendMessage = null, setActiveThreadId = null, closeThread = null } = useMessenger();
    const { report = null } = useHelp();
    const messagesBox = useRef<HTMLDivElement>();
    const statusRef = useRef<Map<number, boolean>>(new Map());
    const [forceUpdate, setForceUpdate] = useState({});

    const followFriend = () => (activeThread && activeThread.participant && SendMessageComposer(new FollowFriendMessageComposer(activeThread.participant.id)));
    const openProfile = () => (activeThread && activeThread.participant && GetUserProfile(activeThread.participant.id));

    const send = () =>
    {
        if(!activeThread || !messageText.length) return;

        sendMessage(activeThread, GetSessionDataManager().userId, messageText);

        setMessageText('');
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        if(event.key !== 'Enter') return;

        send();
    }

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');

                if(parts.length === 2)
                {
                    if(parts[1] === 'open')
                    {
                        setIsVisible(true);

                        return;
                    }

                    if(parts[1] === 'toggle')
                    {
                        setIsVisible(prevValue => !prevValue);

                        return;
                    }

                    const thread = getMessageThread(parseInt(parts[1]));

                    if(!thread) return;

                    setActiveThreadId(thread.threadId);
                    setIsVisible(true);
                }
            },
            eventUrlPrefix: 'friends-messenger/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, [ getMessageThread, setActiveThreadId ]);

    useEffect(() =>
    {
        if(!isVisible || !activeThread) return;

        messagesBox.current.scrollTop = messagesBox.current.scrollHeight;
    }, [ isVisible, activeThread ]);

    useEffect(() => {
        let isMounted = true;
        
        const updateStatus = () => {
            if (!isMounted || !activeThread?.participant) return;

            const participant = activeThread.participant;
            const currentOnline = participant.online;
            const storedStatus = statusRef.current.get(participant.id);

            if (storedStatus === undefined) {
                statusRef.current.set(participant.id, currentOnline);
                return;
            }

            if (storedStatus !== currentOnline) {
                if (isMounted) {
                    activeThread.addStatusNotification(
                        `${participant.name} ist ${currentOnline ? 'online' : 'offline'} gegangen.`
                    );
                    statusRef.current.set(participant.id, currentOnline);
                    setForceUpdate({});
                    
                    if (messagesBox.current) {
                        setTimeout(() => {
                            if (isMounted && messagesBox.current) {
                                messagesBox.current.scrollTop = messagesBox.current.scrollHeight;
                            }
                        }, 50);
                    }
                }
            }
        };

        updateStatus();

        return () => {
            isMounted = false;
        };
    }, [activeThread?.participant?.online]);

    useEffect(() =>
    {
        if(isVisible && !activeThread)
        {
            if(lastThreadId > 0)
            {
                setActiveThreadId(lastThreadId);
            }
            else
            {
                if(visibleThreads.length > 0) setActiveThreadId(visibleThreads[0].threadId);
            }

            return;
        }

        if(!isVisible && activeThread)
        {
            setLastThreadId(activeThread.threadId);
            setActiveThreadId(-1);
        }
    }, [ isVisible, activeThread, lastThreadId, visibleThreads, setActiveThreadId ]);

    if(!isVisible) return null;

    return (
        <NitroCardView
            className="nitro-friends-messenger"
            uniqueKey="nitro-friends-messenger"
            theme="primary-slim"
            style={{ width: isCollapsed ? '386px' : '500px', transition: 'width 0.3s ease-in-out' }}
        >
            <NitroCardHeaderView headerText={ LocalizeText('messenger.window.title', [ 'OPEN_CHAT_COUNT' ], [ visibleThreads.length.toString() ]) } onCloseClick={ event => setIsVisible(false) } />
            <NitroCardContentView>
                <Grid overflow="hidden">
                    <Column size={ isCollapsed ? undefined : 4 } overflow="hidden" style={{ width: isCollapsed ? '60px' : undefined, transition: 'width 0.3s ease-in-out', flexShrink: isCollapsed ? 0 : undefined }}>
                        <Flex alignItems="center" gap={2} justifyContent="between">
                            { !isCollapsed && <Text bold>{ LocalizeText('toolbar.icon.label.messenger') }</Text> }
                            <Button variant="primary" onClick={() => setIsCollapsed(prev => !prev)}>
                                { isCollapsed ? <FaChevronRight className="fa-icon" /> : <FaChevronLeft className="fa-icon" /> }
                            </Button>
                        </Flex>
                        <Column fit overflow="auto">
                            <Column>
                                { visibleThreads && (visibleThreads.length > 0) && visibleThreads.map(thread =>
                                {
                                    return (
                                        <LayoutGridItem key={ thread.threadId } itemActive={ (activeThread === thread) } onClick={ event => setActiveThreadId(thread.threadId) }>
                                            { thread.unread &&
                                            <LayoutItemCountView count={ thread.unreadCount } /> }
                                            <Flex fullWidth alignItems="center" gap={ 1 } overflow="hidden">
                                                <Flex alignItems="center" className="friend-head px-1" position="relative">
                                                    { thread.unread && <Base className="bg-danger rounded-circle position-absolute" style={{ width: '8px', height: '8px', top: '0', right: '0', zIndex: 1 }} /> }
                                                    { (thread.participant.id > 0) &&
                                                    <LayoutAvatarImageView figure={ thread.participant.figure } headOnly={ true } direction={ 3 } /> }
                                                    { (thread.participant.id <= 0) &&
                                                    <LayoutBadgeImageView isGroup={ true } badgeCode={ thread.participant.figure } /> }
                                                </Flex>
                                                { !isCollapsed && <Text truncate grow>{ thread.participant.name }</Text> }
                                            </Flex>
                                        </LayoutGridItem>
                                    );
                                }) }
                            </Column>
                        </Column>
                    </Column>
                    <Column size={ isCollapsed ? undefined : 8 } overflow="hidden" style={{ width: isCollapsed ? '300px' : undefined, flexShrink: isCollapsed ? 0 : undefined }}>
                        { activeThread &&
                            <>
                                <Flex alignItems="center" justifyContent="between" className="bg-light rounded px-2 py-1">
                                    <Flex alignItems="center" gap={ 2 }>
                                        <Base className="message-avatar" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                                            { (activeThread.participant.id > 0) &&
                                            <LayoutAvatarImageView figure={ activeThread.participant.figure } direction={ 2 } style={{ marginLeft: '-22px', marginTop: '-25px' }} /> }
                                            { (activeThread.participant.id <= 0) &&
                                            <LayoutBadgeImageView isGroup={ true } badgeCode={ activeThread.participant.figure } /> }
                                        </Base>
                                        <Text className="fw-bold">{ activeThread.participant.name }</Text>
                                    </Flex>
                                    <Flex alignItems="center">
                                        <ButtonGroup style={{ marginRight: '2px' }}>
                                            <Button onClick={ followFriend }>
                                                <Base className="nitro-friends-spritesheet icon-follow" />
                                            </Button>
                                            <Button onClick={ openProfile }>
                                                <Base className="nitro-friends-spritesheet icon-profile-sm" />
                                            </Button>
                                        </ButtonGroup>
                                        <Button style={{ marginRight: '2px' }} variant="danger" onClick={ () => report(ReportType.IM, { reportedUserId: activeThread.participant.id }) }>
                                            { LocalizeText('messenger.window.button.report') }
                                        </Button>
                                        <Button onClick={ event => closeThread(activeThread.threadId) }>
                                            <FaTimes className="fa-icon" />
                                        </Button>
                                    </Flex>
                                </Flex>
                                <Column fit className="bg-muted p-2 rounded chat-messages">
                                    <Column innerRef={ messagesBox } overflow="auto">
                                        <FriendsMessengerThreadView thread={ activeThread } />
                                    </Column>
                                </Column>
                                <Flex gap={ 1 }>
                                    <input type="text" className="form-control form-control-sm" maxLength={ 255 } placeholder={ LocalizeText('messenger.window.input.default', [ 'FRIEND_NAME' ], [ activeThread.participant.name ]) } value={ messageText } onChange={ event => setMessageText(event.target.value) } onKeyDown={ onKeyDown } />
                                    <Button variant="success" onClick={ send }>
                                        { LocalizeText('widgets.chatinput.say') }
                                    </Button>
                                </Flex>
                            </> }
                    </Column>
                </Grid>
            </NitroCardContentView>
        </NitroCardView>
    );
}
