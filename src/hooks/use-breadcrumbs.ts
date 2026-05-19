import {usePathname} from "next/navigation";

type Breadcrumb = {
    label: string;
    href: string;
};

export function useBreadcrumbs(): Breadcrumb[] {
    const pathname = usePathname();

    // Extract and process path parts
    const pathParts = pathname.split("/").filter(Boolean);

    // Map path segments to breadcrumb objects
    const breadcrumbs = pathParts.map((part, index) => {
        const href = "/" + pathParts.slice(0, index + 1).join("/"); // Reconstruct path for href
        return {
            label: part
                .replace(/-/g, " ") // Replace dashes with spaces, if any
                .replace(/\b\w/g, char => char.toUpperCase()), // Capitalize first letters
            href,
        };
    });

    // Add a static "Home" breadcrumb at the beginning
    return [...breadcrumbs];
}