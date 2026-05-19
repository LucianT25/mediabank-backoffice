import * as React from "react";
import { DateRange } from "react-day-picker";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const useTableFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: searchParams.get("from")
      ? new Date(searchParams.get("from") ?? "")
      : undefined,
    to: searchParams.get("to")
      ? new Date(searchParams.get("to") ?? "")
      : undefined,
  });

  const getFiltersObj = (): Record<string, string> => {
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      // @ts-ignore
      filters[key] = value;
    }

    return filters;
  };

  const getFilters = () => {
    return searchParams.toString();
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    
    replace(`${pathname}?${params.toString()}`);
  };

  const setFilters = (filters: { key: string; value: string }[]) => {
    const params = new URLSearchParams(searchParams);
    filters.forEach((filter) => {
      if (filter.value) {
        params.set(filter.key, filter.value);
      } else {
        params.delete(filter.key);
      }
    });

    replace(`${pathname}?${params.toString()}`);
  };

  const getPageCount = (total?: number) => {
    const pageSize = parseInt(searchParams.get("limit") ?? "10");
    return total ? Math.ceil(total / pageSize) : 0;
  };

  const parseSort = () => {
    const queryString = searchParams.get("sort");
    if (!queryString) return undefined;

    const items = queryString.split(",");
    return {
      col: items[0],
      dir: items[1],
    };
  };

  const setSort = (col: string) => {
    const currentSort = parseSort();
    if (currentSort && currentSort.col === col) {
      setFilters([
        {
          key: "sort",
          value: `${col},${currentSort.dir === "asc" ? "desc" : "asc"}`,
        },
      ]);
    } else {
      setFilters([{ key: "sort", value: `${col},asc` }]);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (!date?.from) params.delete("from");
    else params.set("from", date?.from?.toDateString());

    if (!date?.to) params.delete("to");
    else params.set("to", date?.to?.toDateString());

    replace(`${pathname}?${params.toString()}`);
  }, [date, pathname, replace, searchParams]);

  return {
    getFilters,
    getFiltersObj,
    setFilters,
    clearFilters,
    getPageCount,
    date,
    setDate,
    setSort,
  };
};
