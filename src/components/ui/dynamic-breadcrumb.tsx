"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {useBreadcrumbs} from "@/hooks/use-breadcrumbs";
import { useTranslations } from "next-intl";

export const DynamicBreadcrumb = () => {
    const t = useTranslations("Sidebar");
    let breadcrumbs = useBreadcrumbs();

    breadcrumbs = breadcrumbs.filter((crumb) => {
        return !(['Ro', 'En'].includes(crumb.label));
    });

    const isId = (label: string): boolean => {
        const uuidPattern = /^[0-9a-f]{8}\s[0-9a-f]{4}\s[0-9a-f]{4}\s[0-9a-f]{4}\s[0-9a-f]{12}$/i;
        return uuidPattern.test(label);
    }

    const isMaterialId = (label: string): boolean => {
        const materialIdPattern = /^MB\d{7}$/;
        return materialIdPattern.test(label);
    }

    const getTranslatedLabel = (label: string): string => {
        if (isId(label) || isMaterialId(label)) {
            return label;
        }
        return t(label.toLowerCase());
    }

    return <Breadcrumb>
        <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
                <div className="flex items-center gap-2" key={index}>
                    <BreadcrumbItem >
                        {index < breadcrumbs.length - 1 ? (
                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        ) : (
                            <BreadcrumbPage>{getTranslatedLabel(crumb.label)}</BreadcrumbPage>
                        )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator/>}
                </div>

            ))}
        </BreadcrumbList>
    </Breadcrumb>
}
