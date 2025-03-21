import { FC, useMemo } from 'react';
import { Column, ColumnProps } from '../Column';
import { LayoutItemCountView } from './LayoutItemCountView';
import { LayoutLimitedEditionStyledNumberView } from './limited-edition';

export interface LayoutGridItemProps extends ColumnProps
{
    itemImage?: string;
    itemColor?: string;
    itemActive?: boolean;
    itemCount?: number;
    itemCountMinimum?: number;
    itemUniqueSoldout?: boolean;
    itemUniqueNumber?: number;
    itemUnseen?: boolean;
    itemHighlight?: boolean;
    disabled?: boolean;
}

export const LayoutGridItem: FC<LayoutGridItemProps> = props =>
{
    const { itemImage = undefined, itemColor = undefined, itemActive = false, itemCount = 1, itemCountMinimum = 1, itemUniqueSoldout = false, itemUniqueNumber = -2, itemUnseen = false, itemHighlight = false, disabled = false, center = true, column = true, style = {}, classNames = [], position = 'relative', overflow = 'hidden', children = null, ...rest } = props;

    const getClassNames = useMemo(() =>
    {
        const newClassNames: string[] = [ 'layout-grid-item', 'border', 'border-2', 'border-muted', 'rounded' ];

        if(itemActive) newClassNames.push('active');

        if(itemUniqueSoldout || (itemUniqueNumber > 0)) newClassNames.push('unique-item');

        if(itemUniqueSoldout) newClassNames.push('sold-out');

        if(itemUnseen) newClassNames.push('unseen');

        if(itemHighlight) newClassNames.push('has-highlight');

        if(disabled) newClassNames.push('disabled')

        if(itemImage === null) newClassNames.push('icon', 'loading-icon');

        if(classNames.length) newClassNames.push(...classNames);

        return newClassNames;
    }, [ itemActive, itemUniqueSoldout, itemUniqueNumber, itemUnseen, itemHighlight, disabled, itemImage, classNames ]);

    const getStyle = useMemo(() =>
    {
        let newStyle = { ...style };

        if(itemColor) newStyle.backgroundColor = itemColor;

        if(Object.keys(style).length) newStyle = { ...newStyle, ...style };

        return newStyle;
    }, [ style, itemColor ]);

    return (
        <Column center={ center } pointer position={ position } overflow={ overflow } column={ column } classNames={ getClassNames } style={ getStyle } { ...rest }>
            {itemImage && !(itemUniqueSoldout || (itemUniqueNumber > 0)) && (
                <img 
                    src={itemImage} 
                    loading="lazy" 
                    alt="" 
                    className="position-absolute inset-0 w-100 h-100 object-fit-contain" 
                />
            )}
            { (itemCount > itemCountMinimum) &&
                <LayoutItemCountView count={ itemCount } /> }
            { (itemUniqueNumber > 0) && 
                <>
                    <img 
                        src={itemImage} 
                        loading="lazy" 
                        alt="" 
                        className="unique-bg-override position-absolute inset-0 w-100 h-100 object-fit-contain" 
                    />
                    <div className="position-absolute bottom-0 unique-item-counter">
                        <LayoutLimitedEditionStyledNumberView value={ itemUniqueNumber } />
                    </div>
                </> }
            { children }
        </Column>
    );
}
