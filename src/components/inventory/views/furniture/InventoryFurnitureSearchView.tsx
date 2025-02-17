import { FC } from 'react';
import { FaSearch } from 'react-icons/fa';
import { LocalizeText } from '../../../../api';
import { Button, Flex } from '../../../../common';

export interface InventoryFurnitureSearchViewProps
{
    searchValue: string;
    setSearchValue: (value: string) => void;
}

export const InventoryFurnitureSearchView: FC<InventoryFurnitureSearchViewProps> = props =>
{
    const { searchValue, setSearchValue } = props;

    return (
        <Flex gap={ 1 }>
            <input 
                type="text" 
                className="form-control form-control-sm" 
                placeholder={ LocalizeText('generic.search') } 
                value={ searchValue } 
                onChange={ event => setSearchValue(event.target.value) } 
            />
            <Button variant="primary">
                <FaSearch className="fa-icon" />
            </Button>
        </Flex>
    );
}
