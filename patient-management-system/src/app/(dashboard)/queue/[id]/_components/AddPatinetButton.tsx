import React from 'react';
import Link from "next/link";

const AddPatientButton = ({id} : {id: number}) => {

    console.log('Queue ID', id);

    return (
        <Link href={'#'}>
            Hello
        </Link>
    );
};

export default AddPatientButton;