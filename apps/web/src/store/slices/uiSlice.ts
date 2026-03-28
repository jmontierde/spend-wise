import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebarCollapsed: boolean;
  expenseViewMode: "list" | "calendar";
}

const initialState: UIState = {
  sidebarCollapsed: false,
  expenseViewMode: "list",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setExpenseViewMode(state, action: PayloadAction<"list" | "calendar">) {
      state.expenseViewMode = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setExpenseViewMode } =
  uiSlice.actions;
export default uiSlice.reducer;
