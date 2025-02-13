'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type TBreadCrumbProps = {
    separator: ReactNode;
    containerClasses?: string;
    listClasses?: string;
    activeClasses?: string;
    capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({
    separator,
    containerClasses,
    listClasses,
    activeClasses,
    capitalizeLinks,
}: TBreadCrumbProps) => {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter((segment) => segment);

    // Filter to include only 'brand', 'drug', and 'batch' with their IDs
    const filteredSegments = pathSegments.reduce((acc, segment, index) => {
        if (['brand', 'drug', 'batch'].includes(segment)) {
            const id = pathSegments[index + 1];
            if (id) {
                acc.push({ type: segment, id });
            }
        }
        return acc;
    }, [] as { type: string; id: string }[]);

    return (
        <ul className={containerClasses}>
            <li className={listClasses}>
                <Link href="/inventory/available-stocks?selection=model">Available-Stock</Link>
            </li>
            {filteredSegments.length > 0 && separator}
            {filteredSegments.map((segment, index) => {
                const href = `/inventory/available-stocks/${segment.type}/${segment.id}`;
                const itemClasses =
                    pathname.includes(href) && index === filteredSegments.length - 1
                        ? `${listClasses} ${activeClasses}`
                        : listClasses;
                const itemLink = capitalizeLinks
                    ? `${segment.type[0].toUpperCase()}${segment.type.slice(1)}-${segment.id}`
                    : `${segment.type}-${segment.id}`;
                return (
                    <React.Fragment key={index}>
                        <li className={itemClasses}>
                            <Link href={href}>{itemLink}</Link>
                        </li>
                        {index < filteredSegments.length - 1 && separator}
                    </React.Fragment>
                );
            })}
        </ul>
    );
};

export default NextBreadcrumb;
