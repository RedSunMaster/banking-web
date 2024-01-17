import { Menu, MenuItem } from "@mui/material";
import FlagItem from "../types/FlagItem";
import Transaction from "../types/Transaction";
import { Check } from "@mui/icons-material";

interface FlagPickerProps {
    flagItems: FlagItem[],
    transaction: Transaction | null, // Update type based on actual data
    anchorEl: HTMLButtonElement | null,
    open: boolean,
    handleCloseFlags: () => void,
    handleOpenFlag: () => void,
    handleFlagChange: (transactionId: Number, flagId: Number) => void
}

export const FlagPicker = ({
    flagItems,
    transaction,
    anchorEl,
    open,
    handleCloseFlags,
    handleOpenFlag,
    handleFlagChange
  }: FlagPickerProps) => {
  
  // Check if flagItems is empty
  if (flagItems.length === 0 || flagItems === null) {
    flagItems = []
  }


  return ((transaction && anchorEl)?
    (<Menu key={transaction.transactionID}
    open={open} onClose={handleCloseFlags} anchorEl={anchorEl}
    >
    {flagItems.map((flag) => (
        <MenuItem key={flag.flagId} 
        onClick={(event: React.MouseEvent) => {
            event.stopPropagation()
            handleCloseFlags()
            handleFlagChange(transaction.transactionID, flag.flagId)
        }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
            height: '20px', 
            width: '20px', 
            backgroundColor: flag.flagColour, 
            marginRight: '10px' 
            }} />
            <span>{flag.flagName}</span>
            {transaction.Flags && transaction.Flags.includes(flag.flagId.toString()) && <Check></Check>}
        </div>
        </MenuItem>
    ))}
    <MenuItem onClick={() => handleOpenFlag()}>Add New Flag</MenuItem>
    </Menu>) : (<></>)
  );
};
