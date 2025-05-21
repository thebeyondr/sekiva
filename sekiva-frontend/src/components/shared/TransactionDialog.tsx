import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";
import { useNavigate } from "react-router";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface TransactionDialogProps {
  action: "deploy" | "action";
  id: string;
  destinationShard: string;
  trait?: "ballot" | "collective" | "other";
  returnPath?: string;
  onSuccess?: (contractAddress: string) => void;
  onError?: (error: Error) => void;
}

export function TransactionDialog({
  action,
  id,
  destinationShard,
  trait = "other",
  returnPath,
  onSuccess,
  onError,
}: TransactionDialogProps) {
  const [open, setOpen] = useState(true);
  const [canNavigate, setCanNavigate] = useState(false);
  const navigate = useNavigate();
  const status = useTransactionStatus(id, destinationShard, trait);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (status.isSuccess && status.isFinalized && status.contractAddress) {
      const timer = setTimeout(() => {
        setCanNavigate(true);
        if (onSuccess) {
          onSuccess(status.contractAddress!);
        }
        setShowConfetti(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status.isSuccess, status.isFinalized, status.contractAddress, onSuccess]);

  useEffect(() => {
    if (status.isError && status.error && onError) {
      onError(status.error);
    }
  }, [status.isError, status.error, onError]);

  const getTargetPath = () => {
    if (!status.contractAddress || !returnPath) return returnPath;

    let targetPath = returnPath;
    if (action === "deploy" && status.contractAddress) {
      if (trait === "collective") {
        targetPath = `/collectives/${status.contractAddress}`;
      } else if (trait === "ballot") {
        const collectiveMatch = returnPath.match(/\/collectives\/([^/]+)/);
        const collectiveId = collectiveMatch ? collectiveMatch[1] : "";
        targetPath = `/collectives/${collectiveId}/ballots/${status.contractAddress}`;
      }
    }

    return targetPath;
  };

  const handleClose = () => {
    setOpen(false);

    if (action === "action" && status.isSuccess) {
      window.location.reload();
    }
  };

  const handleViewEntity = () => {
    if (!canNavigate) return;
    setOpen(false);
    const targetPath = getTargetPath();
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const transactionExplorerUrl = `https://browser.testnet.partisiablockchain.com/transactions/${id}`;
  const contractExplorerUrl = status.contractAddress
    ? `https://browser.testnet.partisiablockchain.com/contracts/${status.contractAddress}?tab=state`
    : "";

  const getProgressPercentage = () => {
    if (status.isFinalized) return 100;
    if (status.isSuccess) return 75;
    if (status.isLoading) return 40;
    if (status.isError) return 100;
    return 20;
  };

  const TransactionIdDisplay = () => (
    <div className="w-full flex items-center justify-between mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-500 font-medium">
          Transaction ID:
        </span>
        <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
          {id.substring(0, 8)}...{id.substring(id.length - 8)}
        </code>
      </div>
      <a
        href={transactionExplorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        view <ExternalLink className="w-3 h-3 ml-0.5" />
      </a>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px] border-2 border-black rounded-lg p-0 overflow-hidden transition-all duration-300 shadow-xl">
        <DialogHeader className="border-b border-gray-200 p-4">
          <DialogTitle className="text-xl font-bold">
            {action === "deploy" ? "Deploying" : "Processing"} Transaction
          </DialogTitle>
        </DialogHeader>

        <div
          className={`h-1.5 transition-all duration-700 ease-in-out ${
            status.isError
              ? "bg-red-500"
              : status.isSuccess
                ? "bg-green-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />

        <div className="flex flex-col items-center pb-6 px-5 space-y-6 pt-4">
          {status.isLoading && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative flex items-center justify-center w-24 h-24">
                <div className="absolute inset-0 border-t-4 border-blue-500 border-opacity-40 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-t-4 border-l-4 border-blue-500 rounded-full animate-spin"></div>
                <Loader2 className="h-10 w-10 animate-pulse text-blue-600" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-center text-lg font-medium">
                  Processing transaction
                </p>
                <p className="text-sm text-gray-500">
                  This may take a few moments...
                </p>
              </div>
              <TransactionIdDisplay />
            </div>
          )}

          {status.isSuccess && status.isFinalized && (
            <div className="flex flex-col items-center space-y-4 w-full">
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="confetti-container" aria-hidden="true">
                    {/*TODO: Add SVG confetti elements here if theres time */}
                  </div>
                </div>
              )}
              <h4 className="text-7xl font-bold animate-bounce">🎉</h4>
              <p className="text-center text-xl font-medium leading-tight">
                {action === "deploy"
                  ? `Your ${trait === "ballot" ? "ballot" : "collective"} has been deployed!`
                  : "Your transaction has been processed!"}
              </p>

              <div className="w-full border-t border-gray-200 pt-4 mt-2">
                <h4 className="text-sm font-semibold mb-2">
                  Transaction Details
                </h4>
                <TransactionIdDisplay />

                {action === "deploy" && status.contractAddress && (
                  <div className="w-full flex items-center justify-between mt-3 p-2 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-green-700 font-medium">
                        Contract Address:
                      </span>
                      <code className="text-xs font-mono bg-green-100 px-1.5 py-0.5 rounded text-green-800">
                        {status.contractAddress.substring(0, 8)}...
                        {status.contractAddress.substring(
                          status.contractAddress.length - 8
                        )}
                      </code>
                    </div>
                    <a
                      href={contractExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium text-green-700 hover:text-green-900"
                    >
                      view <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {status.isError && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="relative flex items-center justify-center w-20 h-20 bg-red-50 rounded-full">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <p className="text-center text-lg font-medium">
                There was an error processing your transaction
              </p>
              <div className="w-full bg-red-50 p-4 rounded-md border border-red-200">
                <p className="text-sm text-red-600">
                  {status.error?.message || "Unknown error"}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Try again or contact support if this persists
                </p>
              </div>
              <TransactionIdDisplay />
            </div>
          )}

          <div className="flex flex-col w-full space-y-4 mt-2">
            {status.isSuccess &&
            status.isFinalized &&
            action === "deploy" &&
            getTargetPath() ? (
              <Button
                variant="default"
                onClick={handleViewEntity}
                disabled={!canNavigate}
                className={`w-full py-6 ${
                  canNavigate ? "bg-black hover:bg-stone-800" : "bg-gray-400"
                } text-lg font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]`}
              >
                {!canNavigate ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for confirmation...
                  </div>
                ) : (
                  `View ${trait === "ballot" ? "Ballot" : "Collective"}`
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleClose}
                className={`w-full py-5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  status.isError
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-black hover:bg-stone-800"
                }`}
              >
                {action === "action" && status.isSuccess
                  ? "Close & Refresh"
                  : "Close"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
