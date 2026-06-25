import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useEffect, useMemo } from "react";

interface PaginationProps {
  pageSize: string | number;
  setPageSize: (value: string) => void;
  page: string | number;
  setPage: (value: string) => void;
  pageCount: number;
}

export function Pagination({
  pageSize,
  setPageSize,
  page,
  setPage,
  pageCount,
}: PaginationProps) {
  const pageValue = String(page);
  const pageSizeValue = String(pageSize);
  const safePageCount = Math.max(pageCount, 0);

  useEffect(() => {
    const currentPage = Number(pageValue);
    if (safePageCount === 0) {
      if (currentPage !== 1) {
        setPage("1");
      }
      return;
    }
    if (currentPage > safePageCount) {
      setPage(String(safePageCount));
    }
  }, [pageValue, safePageCount, setPage]);

  const canNext = useMemo(
    () => safePageCount > 0 && Number(pageValue) < safePageCount,
    [pageValue, safePageCount],
  );
  const canPrev = useMemo(() => Number(pageValue) > 1, [pageValue]);

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setPage("1");
  };

  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Page {safePageCount === 0 ? 0 : pageValue} of {safePageCount}
        </span>
        <Select value={pageSizeValue} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-9 w-[72px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[100]">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="sr-only">per page</span>
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(String(Number(pageValue) - 1))}
          disabled={!canPrev}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(String(Number(pageValue) + 1))}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
