import { BadgeImageReadyEvent, NitroSprite, TextureUtils } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { GetConfiguration, GetSessionDataManager, LocalizeBadgeDescription, LocalizeBadgeName, LocalizeText } from '../../api';
import { Base, BaseProps } from '../Base';

export interface LayoutBadgeImageViewProps extends BaseProps<HTMLDivElement>
{
    badgeCode: string;
    isGroup?: boolean;
    showInfo?: boolean;
    customTitle?: string;
    isGrayscale?: boolean;
    scale?: number;
}

export const LayoutBadgeImageView: FC<LayoutBadgeImageViewProps> = props =>
{
    const { badgeCode = null, isGroup = false, showInfo = false, customTitle = null, isGrayscale = false, scale = 1, classNames = [], style = {}, children = null, ...rest } = props;
    const [ imageElement, setImageElement ] = useState<HTMLImageElement>(null);

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'badge-image' ];

        if(isGroup) newClassNames.push('group-badge');

        if(isGrayscale) newClassNames.push('grayscale');

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ classNames, isGroup, isGrayscale ]);

    const getStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        if(imageElement)
        {
            if(scale !== 1)
            {
                newStyle.transform = `scale(${ scale })`;
                if(!(scale % 1)) newStyle.imageRendering = 'pixelated';
            }
        }

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ imageElement, scale, style ]);

    const getImgStyle = useMemo(() =>
    {
        let newStyle: CSSProperties = {};

        if(imageElement)
        {
            newStyle.width = imageElement.width;
            newStyle.height = imageElement.height;

            if(scale !== 1)
            {
                newStyle.width = (imageElement.width * scale);
                newStyle.height = (imageElement.height * scale);
            }
        }

        return newStyle;
    }, [ imageElement, scale ]);

    useEffect(() =>
    {
        if(!badgeCode || !badgeCode.length) return;

        let didSetBadge = false;

        const onBadgeImageReadyEvent = (event: BadgeImageReadyEvent) =>
        {
            if(event.badgeId !== badgeCode) return;

            const element = TextureUtils.generateImage(new NitroSprite(event.image));

            element.onload = () => setImageElement(element);

            didSetBadge = true;

            GetSessionDataManager().events.removeEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);
        }

        GetSessionDataManager().events.addEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);

        const texture = isGroup ? GetSessionDataManager().getGroupBadgeImage(badgeCode) : GetSessionDataManager().getBadgeImage(badgeCode);

        if(texture && !didSetBadge)
        {
            const element = TextureUtils.generateImage(new NitroSprite(texture));

            element.onload = () => setImageElement(element);
        }

        return () => GetSessionDataManager().events.removeEventListener(BadgeImageReadyEvent.IMAGE_READY, onBadgeImageReadyEvent);
    }, [ badgeCode, isGroup ]);

    return (
        <Base classNames={ getClassNames } style={
            isGroup ?
            { ...getStyle, backgroundImage: `url(https://i.hubba.cc/badge/${badgeCode}.gif)`} :
            { ...getStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }
        } { ...rest }>
            {!isGroup && <img
                src={GetConfiguration<string>('badge.asset.url').replace('%badgename%', badgeCode.toString())}
                style={getImgStyle}
                loading="lazy"
                alt={LocalizeBadgeName(badgeCode)}
            />}
            {(showInfo && GetConfiguration<boolean>('badge.descriptions.enabled', true)) &&
                <Base className="badge-information text-black py-1 px-2 small">
                    <div className="fw-bold mb-1">{ isGroup ? customTitle : LocalizeBadgeName(badgeCode) }</div>
                    <div>{ isGroup ? LocalizeText('group.badgepopup.body') : LocalizeBadgeDescription(badgeCode) }</div>
                </Base> }
            { children }
        </Base>
    );
}
