import { StepAction, StepState } from "./types"

export const StepReducer = (
  state: StepState,
  action: StepAction
): StepState => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}
