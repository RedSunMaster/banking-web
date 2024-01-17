import { NumberLiteralType } from "typescript";

interface OwedItem {
    ID: number;
    userId: number;
    Person: string;
    Amount: number;
    Category: string;
    Description: string;
    Date: Date;
    "Days Elapsed": number;
    Payed: boolean;
  }

export default OwedItem