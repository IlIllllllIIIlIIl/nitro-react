import { FC, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MessengerFriend } from '../../../../api';
import { Button, Flex } from '../../../../common';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { FriendBarItemView } from './FriendBarItemView';

export const FriendBarView: FC<{ onlineFriends: MessengerFriend[] }> = props =>
{
    const { onlineFriends = null } = props;
    const [ indexOffset, setIndexOffset ] = useState(0);
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
            { Array.from(Array(displayCount), (e, i) => <FriendBarItemView key={ i } friend={ (onlineFriends[ indexOffset + i ] || null) } />) }
            <Button variant="black" className="friend-bar-button" disabled={ !((onlineFriends.length > displayCount) && ((indexOffset + displayCount) <= (onlineFriends.length - 1))) } onClick={ event => setIndexOffset(indexOffset + 1) }>
                <FaChevronRight className="fa-icon" />
            </Button>
        </Flex>
    );
}
