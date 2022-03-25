function mpReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "submit":
      return { count: state.count - 1 };
    case "submit":
      return { count: state.count - 1 };
    case "submit":
      return { count: state.count - 1 };
    case "submit":
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}
