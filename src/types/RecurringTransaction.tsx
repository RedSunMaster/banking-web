interface RecurringTransactionItem {
    recurringId: number;
    userId: number;
    Date: Date;
    Amount: number;
    Category: string;
    Description: string;
    Transaction: string;
    Frequency: number;
  }

export default RecurringTransactionItem