'use client';

import {Button} from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {useState} from "react";

export interface DiscountSubmitButtonProps {
    discount: number;
    onSubmit: () => void;
    onDiscountRemove?: () => void;
}

export function DiscountSubmitButton({discount, onSubmit, onDiscountRemove}: DiscountSubmitButtonProps) {
    const [open, setOpen] = useState(false);

    const handleRemoveDiscount = () => {
        if (onDiscountRemove) {
            console.log('Calling onDiscountRemove');
            onDiscountRemove();
        }
    };

    return (
        <>
            {discount === 0 ? (
                <Button
                    type="submit"
                    size="lg"
                    className="px-8 w-full"
                    onClick={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    Submit Prescription
                </Button>
            ) : (
                <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="px-8 w-full"
                        >
                            Submit Prescription with {discount}% discount
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Apply <span className="font-semibold text-red-500">{discount}%</span> Discount?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to submit the prescription with a discount
                                of <strong>{discount}%</strong>?
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>
                                <Button onClick={() => {
                                    setOpen(false);
                                    handleRemoveDiscount();
                                }}>
                                    Remove discount
                                </Button>
                                <Button variant="destructive" onClick={() => {
                                    setOpen(false);
                                    onSubmit();
                                }}>
                                    Submit with discount
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}