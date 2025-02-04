import React from 'react';
import {Card} from "@/components/ui/card";

const TopCard = ({id}: {id:number}) => {
    return (
        <Card>
            Hello World, {id}
        </Card>
    );
};

export default TopCard;