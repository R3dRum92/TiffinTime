'use client';

import { useState } from 'react';
import { useVendorInfo } from '@/app/hooks/getVendorDetails';
import { useVendorReviews } from '@/app/hooks/useVendorReviews';
import { MessageSquare, Reply, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorReviewsPage() {
    // 1. Get Vendor ID
    const { vendor } = useVendorInfo();
    const vendorId = vendor?.id || '';

    // 2. Fetch Text Reviews (using the hook we fixed earlier)
    const { data: reviews, isLoading, isError, replyToReview, isReplying } = useVendorReviews(vendorId);

    // 3. Local state for the reply input box
    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const handleSubmitReply = (reviewId: number) => {
        if (!replyText.trim()) {
            toast.error("Reply cannot be empty");
            return;
        }

        replyToReview({ reviewId, replyText });

        // Close the box after submitting
        setReplyingId(null);
        setReplyText('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf4dc]">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-600">Loading customer feedback...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                <p>Failed to load reviews.</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold darktext flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-orange-500" />
                    Customer Reviews
                </h1>
                <p className="lighttext mt-2">
                    Manage and reply to student feedback ({reviews?.length || 0} reviews)
                </p>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews?.length === 0 && (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-orange-100">
                        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">No reviews yet</h3>
                        <p className="text-gray-500">When students review your food, they will appear here.</p>
                    </div>
                )}

                {reviews?.map((review) => (
                    <div
                        key={review.review_id}
                        className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden transition-all hover:shadow-md"
                    >
                        {/* Review Header */}
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                        {review.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{review.username}</h3>
                                        {/* Status Badge */}
                                        {review.is_replied ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                                <CheckCircle2 className="w-3 h-3" /> Replied
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-1">
                                                Pending Reply
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Rating Tags - Note these come from the REVIEW table, not rating table */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-3 py-1 rounded-lg bg-orange-50 text-orange-800 text-xs font-medium border border-orange-100">
                                        🍱 Food: {review.food_quality}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-medium border border-blue-100">
                                        🚚 Delivery: {review.delivery_experience}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button (Reply) */}
                            {!review.is_replied && replyingId !== review.review_id && (
                                <button
                                    onClick={() => {
                                        setReplyingId(review.review_id);
                                        setReplyText('');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                                >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                </button>
                            )}
                        </div>

                        {/* Review Body */}
                        <div className="p-6 bg-[#fafafa]">
                            <p className="text-gray-700 italic">"{review.comment || 'No written comment.'}"</p>
                        </div>

                        {/* Reply Section */}
                        {review.is_replied ? (
                            <div className="bg-green-50/50 p-6 border-t border-green-100">
                                <div className="flex gap-3">
                                    <div className="min-w-[24px]">
                                        <Reply className="w-5 h-5 text-green-600 transform rotate-180" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-700 uppercase mb-1">Replied by you</p>
                                        <p className="text-gray-800 text-sm">{review.reply}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Reply Input Box (Only shows if 'Reply' clicked)
                            replyingId === review.review_id && (
                                <div className="p-6 bg-white border-t border-orange-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Write your reply:</label>
                                    <textarea
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm transition-all"
                                        rows={3}
                                        placeholder="Thank the student or address their concern..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-3 mt-3">
                                        <button
                                            onClick={() => setReplyingId(null)}
                                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSubmitReply(review.review_id)}
                                            disabled={!replyText.trim() || isReplying}
                                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
                                        >
                                            {isReplying && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Post Reply
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}