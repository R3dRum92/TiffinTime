'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { useVendorRatings } from '@/app/hooks/useVendorRating'; // Adjust path if needed
import { cn } from '@/lib/utils';

interface RatingStarsProps {
    vendorId: string;
    variant?: 'readonly' | 'input';
    size?: number;
}

export default function RatingStars({ vendorId, variant = 'readonly', size = 18 }: RatingStarsProps) {
    const { average, count, userRating, submitRating, isSubmitting } = useVendorRatings(vendorId);
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const isReadOnly = variant === 'readonly';

    const displayValue = isReadOnly
        ? average
        : (hoverValue ?? userRating ?? 0);

    return (
        <div className={cn("flex flex-col", isReadOnly ? "items-start" : "items-center")}>
            <div className="flex items-center gap-1">
                <div
                    className="flex gap-0.5"
                    onMouseLeave={() => !isReadOnly && setHoverValue(null)}
                >
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = displayValue >= star;

                        return (
                            <button
                                key={star}
                                type="button"
                                disabled={isReadOnly || isSubmitting}
                                onClick={() => !isReadOnly && submitRating(star)}
                                onMouseEnter={() => !isReadOnly && setHoverValue(star)}
                                className={cn(
                                    "transition-transform",
                                    !isReadOnly && "hover:scale-110 cursor-pointer p-0.5",
                                    isReadOnly && "cursor-default"
                                )}
                            >
                                <Star
                                    size={size}
                                    className={cn(
                                        "transition-colors duration-200",
                                        isFilled
                                            ? "fill-[#D98324] text-[#D98324]"
                                            : "fill-transparent text-gray-300"
                                    )}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* ReadOnly: Show count */}
                {isReadOnly && (
                    <div className="text-sm text-gray-600 font-medium ml-2">
                        {average > 0 ? average.toFixed(1) : "New"}
                        <span className="text-gray-400 font-normal ml-1">
                            ({count} reviews)
                        </span>
                    </div>
                )}
            </div>

            {/* Input: Show Feedback */}
            {!isReadOnly && (
                <div className="h-5 mt-1">
                    {userRating ? (
                        <span className="text-xs font-medium text-[#D98324]">
                            You rated: {userRating} stars
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">
                            Tap to rate
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}