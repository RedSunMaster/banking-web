interface TransactionItem {
    transactionID: number;
    userId: number;
    Date: Date;
    Amount: number;
    Category: string;
    Description: string;
    Transaction: string;
    Flags: string;
    recurringId?: number;
    Tracked: boolean;
  }

export default TransactionItem