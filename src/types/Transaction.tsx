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
  }

export default TransactionItem