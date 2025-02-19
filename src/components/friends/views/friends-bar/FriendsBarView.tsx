import { FC, useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MessengerFriend } from '../../../../api';
import { Button, Flex } from '../../../../common';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { FriendBarItemView } from './FriendBarItemView';

export const FriendBarView: FC<{ friends: MessengerFriend[] }> = props =>
{
    const { friends = null } = props;
    const [ indexOffset, setIndexOffset ] = useState(0);

    // Keep track of online friends in their login order
    const [orderedOnlineFriends, setOrderedOnlineFriends] = useState<MessengerFriend[]>([]);

    // Effect to handle login/logout events
    useEffect(() => {
        if (!friends) {
            setOrderedOnlineFriends([]);
            return;
        }

        setOrderedOnlineFriends(prevOrdered => {
            // Create set of previously online friend IDs for quick lookup
            const prevOnlineIds = new Set(prevOrdered.map(f => f.id));
            // Create set of currently online friend IDs
            const currentOnlineIds = new Set(friends.filter(f => f.online).map(f => f.id));

            // Find newly logged in friends (in currentOnline but not in prevOnline)
            const newlyOnline = friends.filter(f =>
                f.online && !prevOnlineIds.has(f.id)
            );

            // Find friends that are still online (keeps their order)
            const stillOnline = prevOrdered.filter(f =>
                currentOnlineIds.has(f.id)
            );

            // Put newly logged in friends at the start, followed by existing online friends
            return [...newlyOnline, ...stillOnline];
        });
    }, [friends]);

    // Use orderedOnlineFriends as our bar friends
    const barFriends = orderedOnlineFriends;

    const elementRef = useRef<HTMLDivElement>();
    
    const isExtraWideScreen = useMediaQuery('(min-width: 1910px)');
    const isWideScreen = useMediaQuery('(min-width: 1685px)');
    const isTabletScreen = useMediaQuery('(min-width: 1460px)');
    const isPhoneScreen = useMediaQuery('(min-width: 1235px)');
    
    const displayCount = isExtraWideScreen ? 5 : isWideScreen ? 4 : isTabletScreen ? 3 : isPhoneScreen ? 2 : 1;

    return (
        <Flex innerRef={ elementRef } alignItems="center" className="friend-bar">
            <Button variant="black" className="friend-bar-button" disabled={ (indexOffset <= 0) } onClick={ event => setIndexOffset(indexOffset - 1) }>
                <FaChevronLeft className="fa-icon" />
            </Button>
            { Array.from(Array(displayCount), (e, i) => <FriendBarItemView key={ i } friend={ (barFriends[ indexOffset + i ] || null) } />) }
            <Button variant="black" className="friend-bar-button" disabled={ !((barFriends.length > displayCount) && ((indexOffset + displayCount) <= (barFriends.length - 1))) } onClick={ event => setIndexOffset(indexOffset + 1) }>
                <FaChevronRight className="fa-icon" />
            </Button>
        </Flex>
    );
}
