import {myConfirmation, myError} from "@/app/lib/definitions";
import {toast} from "react-toastify";
import {ActionOptions} from "@/app/lib/utils";
import {Button} from "@/components/ui/button";
import {CircleAlert, CircleCheck, Info} from "lucide-react";


type ServerAction = () => Promise<myError>;
type ServerActionWithConfirmation = () => Promise<myError | myConfirmation>;
export const handleServerActionWithConfirmation = async (
    action: ServerActionWithConfirmation,
    confirmAction: ServerAction,
    options: ActionOptions = {}
): Promise<myError> => {
    const {
        loadingMessage = "Processing...",
        position = "bottom-right",
    } = options;

    const id = toast.loading(loadingMessage, {position, pauseOnFocusLoss: false});

    try {
        const result = await action();

        if ('confirmationRequired' in result) {
            toast.update(id, {
                render: (
                    <div className={'flex flex-col gap-4'}>
                        <p>{result.message}</p>
                        <div className={'flex justify-end gap-2'}>
                            <Button onClick={() => {
                                toast.dismiss(id);
                            }} variant={'outline'}>
                                Cancel
                            </Button>
                            <Button onClick={async () => {
                                toast.update(id, {
                                    type: 'info',
                                    render: 'Please wait...',
                                    isLoading: true,
                                    icon: <Info/>,
                                });
                                const finalResult = await confirmAction();
                                toast.update(id, {
                                    render: finalResult.message || "Success!",
                                    type: finalResult.success ? "success" : "error",
                                    isLoading: false,
                                    autoClose: 2000,
                                    icon: finalResult.success ? <CircleCheck color={'green'}/> :
                                        <CircleAlert color={'red'}/>,
                                });
                            }} variant={'destructive'} className={'bg-red-600 hover:bg-red-700 text-white'}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                ),
                type: "error",
                isLoading: false,
                autoClose: false,
                closeOnClick: false,
            });

            return {success: false, message: "Awaiting confirmation"};
        } else {
            // Handle regular result (success or error)
            toast.update(id, {
                render: result.message || (result.success ? "Success!" : "An error occurred!"),
                type: result.success ? "success" : "error",
                isLoading: false,
                autoClose: 2000,
                icon: result.success ? <CircleCheck color={'green'}/> : <CircleAlert color={'red'}/>,
            });

            return result;
        }
    } catch (error) {
        toast.update(id, {
            render: error instanceof Error ? error.message : "An error occurred!",
            type: "error",
            isLoading: false,
            autoClose: 2000,
            icon: <CircleAlert color={'red'}/>,
        });
        return {success: false, message: "An error occurred"};
    }
};