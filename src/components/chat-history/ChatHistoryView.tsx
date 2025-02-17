import { ILinkEventTracker } from '@nitrots/nitro-renderer';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AddEventLinkTracker, ChatEntryType, LocalizeText, RemoveLinkEventTracker } from '../../api';
import { Flex, NitroCardContentView, NitroCardHeaderView, NitroCardView, Text } from '../../common';
import { useChatHistory } from '../../hooks';

export const ChatHistoryView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const [ searchText, setSearchText ] = useState<string>('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { chatHistory = [] } = useChatHistory();
    const elementRef = useRef<HTMLDivElement>(null);
    const autoScroll = useRef<boolean>(true);

    const filteredChatHistory = useMemo(() => 
    {
        if (searchText.length === 0) return chatHistory;

        let text = searchText.toLowerCase();

        return chatHistory.filter(entry => ((entry.message && entry.message.toLowerCase().includes(text))) || (entry.name && entry.name.toLowerCase().includes(text)));
    }, [ chatHistory, searchText ]);

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const div = event.currentTarget;
        const isAtBottom = div.scrollHeight - div.clientHeight - div.scrollTop < 20;
        autoScroll.current = isAtBottom;
    };

    useEffect(() => {
        if (autoScroll.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredChatHistory]);

    useEffect(() => {
        if (isVisible && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [isVisible]);

    useEffect(() =>
    {
        const linkTracker: ILinkEventTracker = {
            linkReceived: (url: string) =>
            {
                const parts = url.split('/');
        
                if(parts.length < 2) return;
        
                switch(parts[1])
                {
                    case 'show':
                        setIsVisible(true);
                        return;
                    case 'hide':
                        setIsVisible(false);
                        return;
                    case 'toggle':
                        setIsVisible(prevValue => !prevValue);
                        return;
                }
            },
            eventUrlPrefix: 'chat-history/'
        };

        AddEventLinkTracker(linkTracker);

        return () => RemoveLinkEventTracker(linkTracker);
    }, []);

    if(!isVisible) return null;

    return (
        <NitroCardView uniqueKey="chat-history" className="nitro-chat-history" theme="primary-slim">
            <NitroCardHeaderView headerText={ LocalizeText('room.chathistory.button.text') } onCloseClick={ event => setIsVisible(false) }/>
            <NitroCardContentView innerRef={ elementRef } overflow="hidden" gap={ 2 }>
                <input type="text" className="form-control form-control-sm" placeholder={ LocalizeText('generic.search') } value={ searchText } onChange={ event => setSearchText(event.target.value) } />
                <div 
                    ref={scrollRef}
                    style={{ 
                        overflowY: 'auto',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '8px'
                    }}
                    onScroll={handleScroll}
                >
                    {filteredChatHistory.map((row, index) => (
                        <Flex key={index} alignItems="center" className="p-1 history" gap={ 2 }>
                            <Text variant="muted">{ row.timestamp }</Text>
                            { (row.type === ChatEntryType.TYPE_CHAT) &&
                                <div className="bubble-container" style={ { position: 'relative' } }>
                                    { (row.style === 0) &&
                                    <div className="user-container-bg" style={ { backgroundColor: row.color } } /> }
                                    <div className={ `chat-bubble bubble-${ row.style } type-${ row.chatType }` } style={ { maxWidth: '100%' } }>
                                        <div className="user-container">
                                            { row.imageUrl && (row.imageUrl.length > 0) &&
                                                <div className="user-image" style={ { backgroundImage: `url(${ row.imageUrl })` } } /> }
                                        </div>
                                        <div className="chat-content">
                                            <b className="username mr-1" dangerouslySetInnerHTML={ { __html: `${ row.name }: ` } } />
                                            <span className="message" dangerouslySetInnerHTML={ { __html: `${ row.message }` } } />
                                        </div>
                                    </div>
                                </div> }
                            { (row.type === ChatEntryType.TYPE_ROOM_INFO) &&
                                <>
                                    <i className="icon icon-small-room" />
                                    <Text textBreak wrap grow>{ row.name }</Text>
                                </> }
                        </Flex>
                    ))}
                </div>
            </NitroCardContentView>
        </NitroCardView>
    );
}
