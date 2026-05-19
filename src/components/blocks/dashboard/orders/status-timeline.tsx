import { formatDate } from "@/lib/utils";
import { OrderStatus, StatusHistory } from "@/interfaces/order.interface";
import { useMemo } from "react";

const PAYMENT_STATUSES = [
    OrderStatus.awaitingPayment,
    OrderStatus.paid,
];
const STATUS_PROGRESSION = [
    OrderStatus.awaitingPayment,
    OrderStatus.paid,
    OrderStatus.inProgress,
    OrderStatus.shipped,
    OrderStatus.done,
    OrderStatus.approved,
    OrderStatus.declined
];

export function StatusTimeline({
                                   statusHistory,
                                   updateStatus,
                               }: {
    statusHistory: StatusHistory[];
    updateStatus: (status: OrderStatus) => void;
}) {
    const statusItems = useMemo(() => {
        return STATUS_PROGRESSION.flatMap((status) => {
            const isPayment = PAYMENT_STATUSES.includes(status);
            // grab *all* entries for this status
            const entries = statusHistory.filter((h) => h.status === status);

            if (entries.length > 0) {
                return entries.map((h, idx) => (
                    <li
                        key={`${status}-${idx}`}
                        className={`mb-6 ml-6 ${
                            !isPayment ? "hover:cursor-pointer hover:bg-muted p-1" : ""
                        }`}
                        onClick={() =>
                            !isPayment && updateStatus && updateStatus(status)
                        }
                    >
            <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </span>
                        <h3 className="font-medium">
                            {status
                                    .charAt(0)
                                    .toUpperCase() +
                                status.slice(1).replace("-", " ")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(h.date)}
                        </p>
                    </li>
                ));
            } else {
                // not yet reached this status
                return (
                    <li
                        key={`${status}-none`}
                        className={`mb-6 ml-6 ${
                            !isPayment ? "hover:cursor-pointer hover:bg-muted p-1" : ""
                        }`}
                        onClick={() =>
                            !isPayment && updateStatus && updateStatus(status)
                        }
                    >
            <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full -left-3 ring-8 ring-white">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
            </span>
                        <h3 className="font-medium">
                            {status
                                    .charAt(0)
                                    .toUpperCase() +
                                status.slice(1).replace("-", " ")}
                        </h3>
                    </li>
                );
            }
        });
    }, [statusHistory, updateStatus]);

    return (
        <ol className="relative border-l border-gray-200 ml-3">
            {statusItems}
        </ol>
    );
}
