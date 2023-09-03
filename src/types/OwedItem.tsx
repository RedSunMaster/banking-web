import { NumberLiteralType } from "typescript";

interface OwedItem {
    owedId: number;
    userId: number;
    person: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
    daysElapsed: number;
    bpayed: boolean
  }

export default OwedItem