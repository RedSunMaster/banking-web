interface GoalItem {
    goalId: number;
    userId: number;
    goalName: string;
    category: string;
    amount: number;
    startDate: Date;
    endDate: Date;
    "Days Elapsed": number;
    achieved: boolean;
    uniqueCode: string;
  }

export default GoalItem