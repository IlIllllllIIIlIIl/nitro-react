import { FC, useMemo } from 'react';
import { GetGroupChatData, GetSessionDataManager, LocalizeText, MessengerGroupType, MessengerThread, MessengerThreadChat, MessengerThreadChatGroup } from '../../../../../api';
import { Base, Flex, LayoutAvatarImageView } from '../../../../../common';

export const FriendsMessengerThreadGroup: FC<{ thread: MessengerThread, group: MessengerThreadChatGroup }> = props =>
{
    const { thread = null, group = null } = props;

    const groupChatData = useMemo(() => ((group.type === MessengerGroupType.GROUP_CHAT) && GetGroupChatData(group.chats[0].extraData)), [ group ]);

    const isOwnChat = useMemo(() =>
    {
        if(!thread || !group) return false;
        
        if((group.type === MessengerGroupType.PRIVATE_CHAT) && (group.userId === GetSessionDataManager().userId)) return true;

        if(groupChatData && group.chats.length && (groupChatData.userId === GetSessionDataManager().userId)) return true;

        return false;
    }, [ thread, group, groupChatData ]);

    if(!thread || !group) return null;
    
    if(!group.userId)
    {
        return (
            <>
                { group.chats.map((chat, index) =>
                {
                    return (
                        <Flex key={ index } fullWidth gap={ 2 } justifyContent="start">
                            <Base className="w-100 text-break">
                                { (chat.type === MessengerThreadChat.ROOM_INVITE) &&
                                    <Flex gap={ 2 } alignItems="center" className="bg-light rounded mb-2 px-2 py-1 small text-black">
                                        <Base className="messenger-notification-icon flex-shrink-0" />
                                        <Base>{ (LocalizeText('messenger.invitation') + ' ') }{ chat.message }</Base>
                                    </Flex> }
                                { (chat.type === MessengerThreadChat.STATUS_NOTIFICATION) &&
                                    <Base className="status-message">
                                        { chat.message }
                                    </Base> }
                            </Base>
                        </Flex>
                    );
                }) }
            </>
        );
    }
    
    return (
        <Flex fullWidth column alignItems={ isOwnChat ? 'end' : 'start' }>
            <Base className={ 'bg-light text-black mb-1 messages-group-' + (isOwnChat ? 'own' : 'left') }>
                { group.chats.map((chat, index) => (
                    <Base key={ index } className="text-break">{ chat.message }</Base>
                )) }
            </Base>
            <Base className="small text-muted" style={{
                paddingLeft: isOwnChat ? '0.5rem' : 'unset',
                paddingRight: isOwnChat ? 'unset' : '0.5rem'
            }}>
                { group.chats[0].date.toLocaleString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }) }
            </Base>
        </Flex>
    );
}
